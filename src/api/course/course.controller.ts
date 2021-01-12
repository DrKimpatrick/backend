import { NextFunction, Request, Response } from 'express';
import { ModelFactory } from '../../models/model.factory';
import { COURSE_VERIFICATION_STATUS, MODELS, STATUS_CODES, USER_ROLES } from '../../constants';
import { logger } from '../../shared/winston';
import { ICourse } from '../../models/interfaces/course.interface';
import { HttpError } from '../../helpers/error.helpers';

/**
 * @function CourseController
 * @description Handles all course related business logic
 *
 */

export class CourseController {
  registerCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.currentUser?._id;

      const userModel = ModelFactory.getModel(MODELS.USER);

      const courseModel = ModelFactory.getModel(MODELS.COURSE);

      const {
        name,
        currentLangSpecsUpdated,
        instructor,
        languageTaught,
        existingCourseLink,
        coverImageLink,
      } = req.body;

      const newCourse = await courseModel.create({
        name,
        currentLangSpecsUpdated,
        instructor,
        languageTaught,
        existingCourseLink,
        coverImageLink,
        userId: id,
      });

      await userModel.updateOne({ _id: id }, { $push: { courses: newCourse } });

      return res
        .status(STATUS_CODES.CREATED)
        .json({ message: 'course saved successfully', data: newCourse });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to save course due to internal server error',
          error
        )
      );
    }
  };

  listCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query;

      const user = req.currentUser;

      let courses: ICourse[];
      let totalItems = 0;

      const courseModel = ModelFactory.getModel(MODELS.COURSE);

      const getAffiliateRole = user?.roles?.find((item) => item === USER_ROLES.TRAINING_AFFILIATE);

      const getSuperAdminRole = user?.roles?.find((item) => item === USER_ROLES.SUPER_ADMIN);

      if (getSuperAdminRole) {
        courses = await courseModel
          .find(
            {},
            {},
            { limit: limit ? Number(limit) : undefined, skip: offset ? Number(offset) : undefined }
          )
          .sort({ updatedAt: -1 })
          .populate('userId', '_id username email avatar');

        totalItems = await courseModel.countDocuments();
      } else if (getAffiliateRole) {
        courses = await courseModel
          .find(
            { userId: user?._id },
            {},
            { limit: limit ? Number(limit) : undefined, skip: offset ? Number(offset) : undefined }
          )
          .sort({ updatedAt: -1 });

        totalItems = await courseModel.countDocuments({ userId: user?._id });
      } else {
        courses = await courseModel
          .find(
            { verificationStatus: COURSE_VERIFICATION_STATUS.ACCEPTED },
            {},
            { limit: limit ? Number(limit) : undefined, skip: offset ? Number(offset) : undefined }
          )
          .sort({ updatedAt: -1 })
          .populate('userId', '_id username email avatar');

        totalItems = await courseModel.countDocuments({
          verificationStatus: COURSE_VERIFICATION_STATUS.ACCEPTED,
        });
      }

      return res.status(STATUS_CODES.OK).json({ data: courses, totalItems });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to fetch courses due to internal server error',
          error
        )
      );
    }
  };

  listSpecificCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = req.currentUser;

      const courseModel = ModelFactory.getModel(MODELS.COURSE);

      let course: ICourse;

      const getAffiliateRole = user?.roles?.find((item) => item === USER_ROLES.TRAINING_AFFILIATE);

      const getSuperAdminRole = user?.roles?.find((item) => item === USER_ROLES.SUPER_ADMIN);

      if (getSuperAdminRole) {
        course = await courseModel.findById(id).populate('userId', '_id username email avatar');
      } else if (getAffiliateRole) {
        course = await courseModel
          .findOne({
            $and: [{ _id: id }, { userId: user?._id }],
          })
          .populate('userId', '_id username email avatar');
      } else {
        course = await courseModel
          .findOne({
            $and: [{ _id: id }, { verificationStatus: COURSE_VERIFICATION_STATUS.ACCEPTED }],
          })
          .populate('userId', '_id username email avatar');
      }

      return res.status(STATUS_CODES.OK).json({ data: course });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to fetch course due to internal server error',
          error
        )
      );
    }
  };

  updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      let data: ICourse;

      const user = req.currentUser;

      const courseModel = ModelFactory.getModel(MODELS.COURSE);

      const getAffiliateRole = user?.roles?.find((item) => item === USER_ROLES.TRAINING_AFFILIATE);

      if (getAffiliateRole) {
        const {
          name,
          currentLangSpecsUpdated,
          instructor,
          languageTaught,
          existingCourseLink,
          coverImageLink,
        } = req.body;

        data = await courseModel.findOneAndUpdate(
          { $and: [{ _id: id }, { userId: user?._id }] },
          {
            $set: {
              name,
              currentLangSpecsUpdated,
              instructor,
              languageTaught,
              existingCourseLink,
              coverImageLink,
            },
          },
          { new: true }
        );
      } else {
        data = await courseModel.findOneAndUpdate(
          { _id: id },
          { $set: { verificationStatus: req.body.verificationStatus } },
          { new: true }
        );
      }

      return res
        .status(STATUS_CODES.OK)
        .json({ message: data ? 'course updated successfully' : 'failed to update course', data });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to update course due to internal server error',
          error
        )
      );
    }
  };

  listCoursesByStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { offset, limit } = req.query;
      const { status } = req.params;

      const courseModel = ModelFactory.getModel(MODELS.COURSE);

      const data = await courseModel
        .find(
          { verificationStatus: status },
          {},
          { limit: limit ? Number(limit) : undefined, skip: offset ? Number(offset) : undefined }
        )
        .populate('userId', '_id username email avatar')
        .sort({ updatedAt: -1 });

      const lastUpdatedItem = await courseModel
        .findOne({ verificationStatus: status })
        .populate('userId', '_id username email avatar')
        .sort({ updatedAt: -1 });

      return res.status(STATUS_CODES.OK).json({
        data,
        totalItems: await courseModel.countDocuments({ verificationStatus: status }),
        lastUpdatedItem,
      });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to fetch courses due to internal server error',
          error
        )
      );
    }
  };
}

export default new CourseController();
