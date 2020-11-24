import { Request, Response } from 'express';
import { ModelFactory } from '../../models/model.factory';
import { DOCUMENT_ACTION, MODELS, STATUS_CODES, USER_ROLES } from '../../constants';
import IBetaTester from '../../models/interfaces/beta-tester.interface';
import { logger } from '../../shared/winston';
import { createSkills } from '../skills/skills.controller';
import { getPagination } from '../../helpers';

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
    const rolesAsString = req.query.roles as string;
    let condition = {};
    if (rolesAsString) {
      condition = { roles: { $in: rolesAsString.split(',') } };
    }
    try {
      const userModel = ModelFactory.getModel(MODELS.USER);
      const { limit, page, offset, totalDocs } = await getPagination(req, userModel, condition);
      const emHistoryModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);
      const edHistoryModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);
      const users = await userModel
        .find(condition)
        .limit(limit)
        .skip(offset)
        .populate({ path: 'employmentHistory', model: emHistoryModel })
        .populate({ path: 'educationHistory', model: edHistoryModel })
        .exec();
      return res.json({
        data: users,
        currentPage: page,
        totalDocs,
        limit,
      });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Server Error' });
    }
  };

  getUser = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const userModel = ModelFactory.getModel(MODELS.USER);
      const emHistoryModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);
      const educationModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);
      const user = await userModel
        .findById(userId)
        .populate({ path: 'employmentHistory', model: emHistoryModel })
        .populate({ path: 'educationHistory', model: educationModel })
        .exec();
      return res.json({ profile: user });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }
  };

  getAuthenticatedUser = async (req: Request, res: Response) =>
    res.status(STATUS_CODES.OK).json({ profile: req.currentUser });

  profileEdit = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const { password } = req.body;
      let { employmentHistory, educationHistory, skills } = req.body;

      if (password) delete req.body.password;

      // validate Skills
      if (skills) {
        try {
          skills = await createSkills(skills, userId);
        } catch (e) {
          logger.info(e);
          return res.status(STATUS_CODES.BAD_REQUEST).json({ message: e.message });
        }
      }

      // validate employmentHistory
      if (employmentHistory) {
        const empH = await this.editUserEmpEduHistory(MODELS.EMPLOYMENT_HISTORY, employmentHistory);
        if (empH.error) {
          return res.status(STATUS_CODES.NOT_FOUND).json({ message: empH.error });
        }
        employmentHistory = empH.data;
      }

      // validate educationHistory
      if (educationHistory) {
        const eduH = await this.editUserEmpEduHistory(MODELS.EDUCATION_HISTORY, educationHistory);
        if (eduH.error) {
          return res.status(STATUS_CODES.NOT_FOUND).json({ message: eduH.error });
        }
        educationHistory = eduH.data;
      }

      delete req.body?.employmentHistory;
      delete req.body?.educationHistory;
      // should not update email
      delete req.body?.email;
      delete req.body?.skills;

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

      return res.json({ profile: { ...user.toJSON(), skills } });
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
      const userSkillsModel = ModelFactory.getModel(MODELS.USER_SKILLS);
      let talents = [];
      if (skills) {
        const skillIds = skills.split(',');
        const userSkills = await userSkillsModel
          .find({ skill: { $in: skillIds } })
          .populate({
            path: 'user',
            match: {
              roles: { $in: [USER_ROLES.TALENT] },
            },
          })
          .exec();
        talents = userSkills.map((x: Record<string, unknown>) => x.user).filter((x) => !!x);
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

  fetchUserSkillsByUserId = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const userSkillModel = ModelFactory.getModel(MODELS.USER_SKILLS);

      const data = await userSkillModel
        .find({ user: userId })
        .select('-user')
        .populate('skill')
        .exec();

      return res.status(STATUS_CODES.OK).json({ data });
    } catch (error) {
      logger.error(error);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: error.message });
    }
  };
}

const userController = new UserController();

export default userController;
