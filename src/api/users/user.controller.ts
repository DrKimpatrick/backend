import { NextFunction, Request, Response } from 'express';
import { ModelFactory } from '../../models/model.factory';
import { DOCUMENT_ACTION, MODELS, STATUS_CODES, USER_ROLES } from '../../constants';
import IBetaTester from '../../models/interfaces/beta-tester.interface';
import { createSkills } from '../skills/skills.controller';
import { getPagination } from '../../helpers';
import IUser from '../../models/interfaces/user.interface';
import { HttpError } from '../../helpers/error.helpers';
import { encryptText } from '../../helpers/auth.helpers';
import { environment } from '../../config/environment';

/**
 * @function UserController
 * @description Handles all user related business logic
 *
 */
export class UserController {
  async addBetaTester(req: Request, res: Response, next: NextFunction) {
    try {
      const betaTesterModel = ModelFactory.getModel<IBetaTester>(MODELS.BETA_TESTER);
      const { accountType, name, email } = req.body;
      const newBetaTester = await betaTesterModel.create({ accountType, name, email });

      return res.status(STATUS_CODES.CREATED).json({
        message: 'Your data is saved, you will be informed once the beta programme is ready',
        data: newBetaTester,
      });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Could not save user information due to internal server error'
        )
      );
    }
  }

  listUsers = async (req: Request, res: Response, next: NextFunction) => {
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
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Could not fetch users due to internal server error'
        )
      );
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;

      const userModel = ModelFactory.getModel(MODELS.USER);

      const emHistoryModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);

      const educationModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);

      const courseModel = ModelFactory.getModel(MODELS.COURSE);

      let user: IUser;

      const findUserByUsername = await userModel
        .findOne({ username: userId })
        .populate({ path: 'employmentHistory', model: emHistoryModel })
        .populate({ path: 'educationHistory', model: educationModel })
        .populate({ path: 'courses', model: courseModel })
        .exec();

      if (findUserByUsername) {
        user = findUserByUsername;
      } else {
        user = await userModel
          .findById(userId)
          .populate({ path: 'employmentHistory', model: emHistoryModel })
          .populate({ path: 'educationHistory', model: educationModel })
          .populate({ path: 'courses', model: courseModel })
          .exec();
      }

      return res.json({ profile: user });
    } catch (e) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Could not fetch user due to internal server error'
        )
      );
    }
  };

  getAuthenticatedUser = async (req: Request, res: Response) =>
    res.status(STATUS_CODES.OK).json({ profile: req.currentUser });

  profileEdit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;

      const currentUserId = req.currentUser?.id;
      if (!req.currentUser || !req.currentUser.isSuperAdmin) {
        if (userId !== currentUserId?.toString()) {
          return res.status(STATUS_CODES.UNAUTHORIZED).json({
            error: 'You are not authorized to update this profile',
          });
        }
      }

      const { password, roles } = req.body;
      let { skills } = req.body;

      if (password) delete req.body.password;

      // validate Skills
      if (skills) {
        try {
          skills = await createSkills(skills, userId);
        } catch (e) {
          return next(new HttpError(STATUS_CODES.BAD_REQUEST, e.message));
        }
      }

      const setUpdate: any = {};
      if (roles) {
        setUpdate.roles = roles;

        if (
          !roles.includes(String(USER_ROLES.TRAINING_AFFILIATE)) &&
          !roles.includes(String(USER_ROLES.TRAINNING_ADMIN)) &&
          !roles.includes(String(USER_ROLES.SUPER_ADMIN))
        ) {
          const encrypt = encryptText(userId);

          setUpdate.sharedLink = `${environment.registerUrlFrontend}?reference=${encrypt}`;
        }
      }

      delete req.body?.roles;
      delete req.body?.role;
      // should not update email
      delete req.body?.email;
      delete req.body?.skills;

      const userModel = ModelFactory.getModel(MODELS.USER);
      const user = await userModel
        .findByIdAndUpdate(userId, { ...req.body, $set: setUpdate }, { new: true })
        .exec();
      if (user == null) {
        return next(new HttpError(STATUS_CODES.NOT_FOUND, 'User not found'));
      }

      return res.json({ profile: { ...user.toJSON(), skills } });
    } catch (e) {
      return next(new HttpError(STATUS_CODES.SERVER_ERROR, `${e.message}`, e));
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

  getTalents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skills = req.query.skills as string;
      const subscription = req.query.subscription as string;
      const { searchSkillKey } = req.query;
      const isSuperAdmin = req.currentUser?.isSuperAdmin;

      const userModel = ModelFactory.getModel(MODELS.USER);
      const couponModel = ModelFactory.getModel(MODELS.USER_COUPON);

      let skillIds = [];
      let subscriptions: string[] = [];

      if (skills) {
        skillIds = skills.split(',');
      }

      if (subscription) {
        subscriptions = subscription.split(',');
      }

      if (searchSkillKey) {
        const skillModel = ModelFactory.getModel(MODELS.SKILL);
        const data = await skillModel
          .find({ skill: { $regex: searchSkillKey, $options: 'i' } })
          .select('_id')
          .exec();
        if (Array.isArray(data) && data.length) {
          skillIds = data.map((skill) => skill._id.toString());
        }
      }

      let subscriptionCondition = {};

      if (skillIds.length && subscriptions.length) {
        subscriptionCondition = { featureChoice: { $in: subscriptions } };
      }

      let couponIssuerCondition = {};

      if (!isSuperAdmin) {
        couponIssuerCondition = { issuer: req.currentUser?.id.toString() };
      }

      let talents = [];

      if (skillIds.length) {
        const userSkillsModel = ModelFactory.getModel(MODELS.USER_SKILLS);
        const userSkills = await userSkillsModel
          .find({ skill: { $in: skillIds } })
          .populate({
            path: 'user',
            match: {
              roles: { $in: [USER_ROLES.TALENT] },
              ...subscriptionCondition,
            },
            populate: {
              path: 'userCouponDetails',
              model: couponModel,
              match: {
                ...couponIssuerCondition,
              },
              select: 'issuer coupon',
            },
          })
          .exec();
        talents = isSuperAdmin
          ? userSkills.map((x: Record<string, unknown>) => x.user).filter((x) => !!x)
          : userSkills
              .map((x: Record<string, IUser>) => x.user)
              .filter((x) => !!x && x.userCouponDetails?.length);
      }

      if (subscriptions.length && !skills && !searchSkillKey) {
        talents = await userModel
          .find({ featureChoice: { $in: subscriptions }, roles: [USER_ROLES.TALENT] })
          .populate({
            path: 'userCouponDetails',
            model: couponModel,
            match: {
              ...couponIssuerCondition,
            },
            select: 'issuer coupon',
          })
          .exec();
        if (!isSuperAdmin) {
          talents = talents.filter(
            (x) => Array.isArray(x.userCouponDetails) && x.userCouponDetails?.length
          );
        }
      }

      if (!talents.length) {
        return next(new HttpError(STATUS_CODES.NOT_FOUND, 'No talent users found'));
      }
      return res.json({ data: talents });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Could not fetch talent data due to internal server error',
          error
        )
      );
    }
  };

  fetchUserSkillsByUserId = async (req: Request, res: Response, next: NextFunction) => {
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
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Could not fetch user skiils  due to internal server error'
        )
      );
    }
  };

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(STATUS_CODES.OK).json({ data: { files: req.files } });
    } catch (error) {
      return next(
        new HttpError(STATUS_CODES.SERVER_ERROR, 'Failed to upload due to internal server error')
      );
    }
  };

  getRecommendedUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.currentUser?._id;

      const userModel = ModelFactory.getModel(MODELS.USER);

      const find = await userModel.find({ recommendedBy: id }).sort({ updatedAt: -1 });

      return res.json({ data: find });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable perform action due to internal server error'
        )
      );
    }
  };
}

const userController = new UserController();

export default userController;
