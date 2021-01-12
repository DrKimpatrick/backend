import { NextFunction, Request, Response } from 'express';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES } from '../../constants';
import { logger } from '../../shared/winston';
import { EducationHistory } from '../../models/interfaces/education.interface';
import { HttpError } from '../../helpers/error.helpers';

/**
 * @function UserController
 * @description Handles all user related business logic
 *
 */
export class EducationController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.currentUser?.id;
      const educ = req.body;
      if (educ.endDate) {
        educ.isCurrent = false;
      }
      const educModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);
      const educationHistory = await educModel.create(educ);

      const userModel = ModelFactory.getModel(MODELS.USER);
      await userModel.findByIdAndUpdate(
        userId,
        {
          $push: { educationHistory: educationHistory.id.toString() },
        },
        { new: true }
      );

      return res.json({ data: educationHistory });
    } catch (e) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to create education history due to internal server error',
          e
        )
      );
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eduId = req.params.id;
      let userId = req.currentUser?.id;
      if (req.params.userId && req.currentUser?.isSuperAdmin) {
        userId = req.params.userId;
      }

      const educModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);
      const userModel = ModelFactory.getModel(MODELS.USER);
      let data;
      if (eduId) {
        data = await educModel.findById(eduId).exec();
      } else {
        data = await userModel.findById(userId).populate('educationHistory').exec();
        data = data.educationHistory;
      }

      return res.json({ data });
    } catch (e) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to fetch education history due to internal server error',
          e
        )
      );
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eduId = req.params.id;
      let userId = req.currentUser?.id;
      if (req.params.userId && req.currentUser?.isSuperAdmin) {
        userId = req.params.userId;
      }

      const educModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);
      let data = await educModel.findById(eduId).exec();

      const userModel = ModelFactory.getModel(MODELS.USER);
      const user = await userModel.findById(userId).exec();
      if (!user) {
        return next(new HttpError(STATUS_CODES.BAD_REQUEST, 'Could not find this user'));
      }
      if (!user.educationHistory.includes(data.id.toString())) {
        return next(
          new HttpError(STATUS_CODES.BAD_REQUEST, 'User has no matching education record')
        );
      }
      data = await educModel.findByIdAndDelete(data.id.toString()).exec();
      await userModel
        .findByIdAndUpdate(
          userId,
          {
            $pull: { educationHistory: data.id.toString() },
          },
          { new: true }
        )
        .exec();

      return res.status(STATUS_CODES.NO_CONTENT).json({ data });
    } catch (e) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to delete education history due to internal server error',
          e
        )
      );
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eduId = req.params.id;
      const eduModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);
      let update: Record<string, any> = req.body;

      const userModel = ModelFactory.getModel(MODELS.USER);
      let userId = req.currentUser?.id;
      if (req.params.userId && req.currentUser?.isSuperAdmin) {
        userId = req.params.userId;
      }

      if (
        req.currentUser?.isSuperAdmin &&
        req.params.userId.toString() !== req.currentUser?.id.toString()
      ) {
        // super admin not trying to edit his own profile, then he can only update its status
        update = {};
        if (req.body.verificationStatus) {
          update = { verificationStatus: req.body.verificationStatus };
        }
      } else {
        // user cannot verify his own education
        delete update.verificationStatus;
      }

      const user = await userModel.findById(userId).exec();
      if (!user) {
        return next(new HttpError(STATUS_CODES.BAD_REQUEST, 'Could not find this user'));
      }
      if (!user.educationHistory.includes(eduId)) {
        return next(
          new HttpError(STATUS_CODES.BAD_REQUEST, 'User has no matching education record')
        );
      }
      const data = await eduModel.findByIdAndUpdate(eduId, update, { new: true }).exec();

      return res.status(STATUS_CODES.OK).json({ data });
    } catch (e) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to update education history due to internal server error',
          e
        )
      );
    }
  };

  changeEducationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const { verificationStatus } = req.body;

      const educationModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);

      const updateEducation = await educationModel.findByIdAndUpdate(
        { _id: id },
        { $set: { verificationStatus } },
        { new: true, runValidators: true }
      );

      if (!updateEducation) {
        return next(new HttpError(STATUS_CODES.NOT_FOUND, 'education not found'));
      }

      return res
        .status(STATUS_CODES.OK)
        .json({ data: updateEducation, message: 'updated successfully' });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to update education status due to internal server error',
          error
        )
      );
    }
  };
}

const educationController = new EducationController();

export default educationController;
