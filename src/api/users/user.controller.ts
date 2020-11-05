import { Request, Response } from 'express';
import { ModelFactory } from '../../models/model.factory';
import {
  COURSE_VERIFICATION_STATUS,
  DOCUMENT_ACTION,
  MODELS,
  STATUS_CODES,
  USER_ROLES,
} from '../../constants';
import IBetaTester from '../../models/interfaces/beta-tester.interface';
import { logger } from '../../shared/winston';
import { ICourse } from '../../models/interfaces/course.interface';

/**
 * @function UserController
 * @description Handles all user related business logic
 *
 */
export class UserController {
  async addBetaTester(req: Request, res: Response) {
    try {
      const betaTesterModel = ModelFactory.getModel<IBetaTester>(MODELS.BETA_TESTER);
      const { accountType, name, email } = req.body;
      const newBetaTester = await betaTesterModel.create({ accountType, name, email });

      return res.status(STATUS_CODES.CREATED).json({
        message: 'Your data is saved, you will be informed once the beta programme is ready',
        data: newBetaTester,
      });
    } catch (error) {
      logger.error(error);
      return res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ error: 'Could not save user information due to internal server error' });
    }
  }

  listUsers = async (req: Request, res: Response) => {
    try {
      const userModel = ModelFactory.getModel(MODELS.USER);
      const users = await userModel.find().exec();
      return res.json({ data: users });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Server Error' });
    }
  };

  getUser = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const userModel = ModelFactory.getModel(MODELS.USER);
      const user = await userModel.findById(userId).exec();
      return res.json({ profile: user });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }
  };

  getAuthenticatedUser = async (req: Request, res: Response) => {
    return res.status(STATUS_CODES.OK).json({ profile: req.currentUser });
  };

  profileEdit = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const { password, skills } = req.body;
      let { employmentHistory, educationHistory } = req.body;

      if (password) delete req.body.password;

      // validate Skills
      if (skills) {
        const skillModel = ModelFactory.getModel(MODELS.SKILLS);
        let records = await skillModel.find().where('_id').in(skills).select('_id').exec();
        records = records.map((x) => x._id.toString());

        const notFound = skills.filter((id: string) => !records.includes(id));
        if (notFound.length > 0) {
          return res
            .status(STATUS_CODES.NOT_FOUND)
            .json({ message: `Skills '${notFound}', could not be found` });
        }
      }

      // validate employmentHistory
      if (employmentHistory) {
        const empH = await this.editUserEmpEduHistory(MODELS.EMPLOYMENT_HISTORY, employmentHistory);
        if (!!empH.error) {
          return res.status(STATUS_CODES.NOT_FOUND).json({ message: empH.error });
        }
        employmentHistory = empH.data;
      }

      // validate educationHistory
      if (educationHistory) {
        const eduH = await this.editUserEmpEduHistory(MODELS.EDUCATION_HISTORY, educationHistory);
        if (!!eduH.error) {
          return res.status(STATUS_CODES.NOT_FOUND).json({ message: eduH.error });
        }
        educationHistory = eduH.data;
      }

      delete req.body?.employmentHistory;
      delete req.body?.educationHistory;
      // should not update email
      delete req.body?.email;

      const userModel = ModelFactory.getModel(MODELS.USER);
      const user = await userModel
        .findByIdAndUpdate(
          userId,
          {
            ...req.body,
            $set: { employmentHistory, educationHistory },
          },
          { new: true }
        )
        .exec();
      if (user == null) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
      }

      return res.json({ profile: user });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: `Error: ${e.message}` });
    }
  };

  private editUserEmpEduHistory = async (
    modelName: string,
    data: any[]
  ): Promise<{ error: string | null; data: any }> => {
    const model = ModelFactory.getModel(modelName);

    let newDocs = data.filter((x: any) => x.action.toLowerCase() === DOCUMENT_ACTION.CREATE);
    const updateDocs = data.filter((x: any) => x.action.toLowerCase() === DOCUMENT_ACTION.UPDATE);
    const deleteDocs = data.filter((x: any) => x.action.toLowerCase() === DOCUMENT_ACTION.DELETE);

    // Find all existing docs and verify they exist
    const mergeExisting = [...updateDocs, ...deleteDocs];
    const ids = mergeExisting.map((x: any) => (x.id || x._id).toString());
    let found = await model.find().where('_id').in(ids).select('_id').exec();
    found = found.map((x) => x._id.toString());
    // filter those that were not found in the DB
    const notFound = ids.filter((id: string) => !found.includes(id));
    if (notFound.length > 0) {
      return { error: `Doc(s) '${notFound}', could not be found`, data: null };
    }

    // DO update the existing ones
    for (const doc of updateDocs) {
      const id = (doc.id || doc._id).toString();
      delete doc.id;
      delete doc._id;
      delete doc.action;
      await model.findByIdAndUpdate(id, doc).exec();
    }
    // DO Delete the existing ones
    if (deleteDocs.length > 0) {
      const ids1 = deleteDocs.map((x: any) => (x.id || x._id).toString());
      await model.deleteMany({ _id: { $in: ids1 } }).exec();
    }
    // also crete the new ones
    if (newDocs.length > 0) {
      newDocs = newDocs.map((x) => {
        delete x.action;
        return x;
      });
      newDocs = await model.create(newDocs);
    }

    return { error: null, data: [...updateDocs, ...newDocs].map((c) => c._id.toString()) };
  };

  getTalents = async (req: Request, res: Response) => {
    const skills = req.query.skills as string;
    const { subscription } = req.query;
    try {
      const userModel = ModelFactory.getModel(MODELS.USER);
      let talents = [];
      if (skills) {
        const skillIds = skills.split(',');
        talents = await userModel
          .find({ skills: { $in: skillIds }, roles: [USER_ROLES.TALENT] })
          .exec();
      }
      if (subscription) {
        talents = await userModel
          .find({ featureChoice: subscription, roles: [USER_ROLES.TALENT] })
          .exec();
      }
      if (talents.length === 0) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'No users found' });
      }
      return res.json({ data: talents });
    } catch (error) {
      logger.info(error);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ error: error.message });
    }
  };

  registerCourse = async (req: Request, res: Response): Promise<Response<{ message: string }>> => {
    try {
      const id = req.currentUser?._id;

      const userModel = ModelFactory.getModel(MODELS.USER);

      const courseModel = ModelFactory.getModel(MODELS.COURSE);

      const newCourse = await new courseModel({ ...req.body }).save();

      // update user collections
      await userModel.updateOne({ _id: id }, { $push: { courses: newCourse } });

      return res.status(STATUS_CODES.CREATED).json({ message: 'course saved successfully' });
    } catch (error) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'something went wrong' });
    }
  };

  listCourses = async (req: Request, res: Response): Promise<Response<{ courses: ICourse[] }>> => {
    try {
      const { limit } = req.query;

      const user = req.currentUser;

      let courses: ICourse[];

      const courseModel = ModelFactory.getModel(MODELS.COURSE);

      const getTalentRole = user?.roles?.find((item) => item === USER_ROLES.TALENT);

      if (getTalentRole) {
        courses = await courseModel
          .find(
            { verificationStatus: COURSE_VERIFICATION_STATUS.ACCEPTED },
            {},
            { limit: limit ? Number(limit) : undefined }
          )
          .sort({ createdAt: -1 });
      } else {
        courses = await courseModel
          .find({}, {}, { limit: limit ? Number(limit) : undefined })
          .sort({ createdAt: -1 });
      }

      return res.status(STATUS_CODES.OK).json({ courses });
    } catch (error) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'something went wrong' });
    }
  };

  listSpecificCourse = async (
    req: Request,
    res: Response
  ): Promise<Response<{ course: ICourse }>> => {
    try {
      const { id } = req.params;

      const user = req.currentUser;

      const courseModel = ModelFactory.getModel(MODELS.COURSE);

      let course: ICourse;

      const getTalentRole = user?.roles?.find((item) => item === USER_ROLES.TALENT);

      if (getTalentRole) {
        //
        course = await courseModel.findOne({
          $and: [{ _id: id }, { verificationStatus: COURSE_VERIFICATION_STATUS.ACCEPTED }],
        });
      } else {
        course = await courseModel.findById(id);
      }

      return res.status(STATUS_CODES.OK).json({ course });
    } catch (error) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'something went wrong' });
    }
  };

  updateCourse = async (req: Request, res: Response): Promise<Response<{ message: string }>> => {
    try {
      const { id } = req.params;

      const courseModel = ModelFactory.getModel(MODELS.COURSE);

      await courseModel.findOneAndUpdate({ _id: id }, { $set: { ...req.body } });

      return res.status(STATUS_CODES.OK).json({ message: 'course updated successfully' });
    } catch (error) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'something went wrong' });
    }
  };
}

const userController = new UserController();

export default userController;
