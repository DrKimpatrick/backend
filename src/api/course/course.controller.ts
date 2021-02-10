import { NextFunction, Request, Response } from 'express';
import { ModelFactory } from '../../models/model.factory';
import { COURSE_VERIFICATION_STATUS, MODELS, STATUS_CODES, USER_ROLES } from '../../constants';
import { ICourse } from '../../models/interfaces/course.interface';
import { HttpError } from '../../helpers/error.helpers';
import stripeController from '../stripe/stripe.controller';
import { getPagination, calculateCourseConversionRate } from '../../helpers';

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

      if (req.body.verificationStatus) {
        delete req.body.verificationStatus;
      }

      const newCourse = await courseModel.create({
        ...req.body,
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
          .populate('userId', '_id username email avatar')
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

      let course: ICourse | null;

      const user = req.currentUser;

      const courseModel = ModelFactory.getModel<ICourse>(MODELS.COURSE);

      const getAffiliateRole = user?.roles?.find((item) => item === USER_ROLES.TRAINING_AFFILIATE);

      if (getAffiliateRole) {
        course = await courseModel.findOneAndUpdate(
          { $and: [{ _id: id }, { userId: user?._id }] },
          {
            $set: {
              ...req.body,
            },
          },
          { new: true }
        );

        return res.status(STATUS_CODES.OK).json({
          message: course ? 'course updated successfully' : 'failed to update course',
          data: course,
        });
      }

      const { verificationStatus } = req.body;

      course = await courseModel.findOneAndUpdate(
        { _id: id },
        { $set: { verificationStatus } },
        { new: true }
      );

      if (course && verificationStatus === COURSE_VERIFICATION_STATUS.ACCEPTED) {
        const result = await stripeController.createAffiliateProduct(course);
        course = await courseModel.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              stripeInfo: { productId: result?.course.id || '', priceId: result?.price.id || '' },
            },
          },
          { new: true }
        );
      }

      return res.status(STATUS_CODES.OK).json({
        message: course ? 'course updated successfully' : 'failed to update course',
        data: course,
      });
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

  groupNumberOfCourseByOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseModel = ModelFactory.getModel(MODELS.COURSE);

      let query;

      const condition = [
        { $match: { verificationStatus: COURSE_VERIFICATION_STATUS.ACCEPTED } },
        { $group: { _id: '$userId', count: { $sum: 1 }, users: { $push: '$userId' } } },
        { $lookup: { from: 'users', foreignField: '_id', localField: '_id', as: 'users' } },
        {
          $project: {
            _id: 1,
            count: 1,
            'users._id': 1,
            'users.username': 1,
            'users.profilePicture': 1,
          },
        },
      ];

      const { limit, page } = req.query;

      if (limit && page) {
        const pageSize = Number(limit);

        const currentPage = Number(page);

        const skip = currentPage > 0 ? (currentPage - 1) * pageSize : 1;

        query = [...condition, { $skip: skip }, { $limit: pageSize }];
      } else {
        query = condition;
      }

      const find = await courseModel.aggregate(query);

      const totalDocs = await courseModel.aggregate(condition).count('totalDocs');

      return res.status(STATUS_CODES.OK).json({
        data: find,
        totalDocs: totalDocs && totalDocs.length > 0 ? totalDocs[0].totalDocs : 0,
        limit: Number(limit) || 0,
        currentPage: Number(page) || 0,
      });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to fetch training due to internal server error',
          error
        )
      );
    }
  };

  listCourseOfAffiliateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const courseModel = ModelFactory.getModel(MODELS.COURSE);

      const condition = {
        $and: [{ userId: id }, { verificationStatus: COURSE_VERIFICATION_STATUS.ACCEPTED }],
      };

      if (req.query.limit && req.query.page) {
        const { limit, page, totalDocs, offset } = await getPagination(req, courseModel, condition);

        const find = await courseModel
          .find(condition)
          .limit(limit)
          .skip(offset)
          .populate('userId', '_id username profilePicture bio');

        return res.json({ data: find, totalDocs, currentPage: page });
      }

      const find = await courseModel
        .find(condition)
        .populate('userId', '_id username profilePicture bio');

      return res.json({ data: find, totalDocs: find.length, currentPage: 1 });
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

  fetchSoldCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const courseModel = ModelFactory.getModel<ICourse>(MODELS.COURSE);
      const courses = await courseModel.find({ customers: userId });

      return res.json({ data: courses || [] });
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

  getCourseBuyers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const courseModel = ModelFactory.getModel<ICourse>(MODELS.COURSE);
      const courses = await courseModel.findById(courseId).populate('customers');

      return res.json({ data: courses?.customers || [] });
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

  addViewToCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const userId = req.currentUser?.id;
      const courseModel = ModelFactory.getModel<ICourse>(MODELS.COURSE);
      await courseModel.updateOne({ _id: courseId }, { $addToSet: { views: userId } });
      res.status(STATUS_CODES.OK).json({ message: 'View is added successfully', userId });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to add view due to internal server error',
          error
        )
      );
    }
  };
    
  GetStatsOfCoursesForAffiliate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const affiliateId = req.params.id;

      const courseModel = ModelFactory.getModel<ICourse>(MODELS.COURSE);

      const courses = await courseModel
        .find({
          userId: affiliateId.toString(),
          verificationStatus: COURSE_VERIFICATION_STATUS.ACCEPTED,
        })
        .select('_id customers views price')
        .exec();

      let viewers: string[] = [];
      let customers: string[] = [];
      let totalCoursesPrice = 0;
      let totalCoursesLinks = 0;

      if (Array.isArray(courses) && courses.length) {
        courses.forEach((course) => {
          if (Array.isArray(course?.views) && course?.views.length) {
            const stringsArray = course.views.map((v) => v.toString());
            viewers = [...viewers, ...stringsArray];
          }
          if (Array.isArray(course?.customers) && course?.customers.length) {
            const stringsArray = course.customers.map((u) => u.toString());
            customers = [...customers, ...stringsArray];
          }
          totalCoursesPrice += Number(course.price);
        });
        totalCoursesLinks = courses.length;
      }

      const conversionRate = calculateCourseConversionRate(viewers, customers);

      return res.status(STATUS_CODES.OK).json({
        conversionRate,
        views: viewers.length,
        totalCoursesPrice,
        totalCoursesLinks
      });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to get stats of courses for affiliate due to internal server error',
          error
        )
      );
    }
  };

  // This controller will change and use real transactions
  getQuarterlyCommissionForAffiliate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const affiliateId = req.params.id;

      const courseModel = ModelFactory.getModel<ICourse>(MODELS.COURSE);

      const courses = await courseModel
        .find({
          userId: affiliateId.toString(),
          verificationStatus: COURSE_VERIFICATION_STATUS.ACCEPTED,
        })
        .select('_id customers price')
        .exec();

      const today = new Date();
      const monthsInQuarter = 3;

      // This varies based on an admin input
      const affiliatePercentage = 60;

      // Current number of months in this quarter
      const currentMonthsInQuarter =
        (today.getMonth() + 1) % 3 === 0 ? monthsInQuarter : (today.getMonth() + 1) % 3;

      let conversionPayments = 0;

      if (Array.isArray(courses) && courses.length) {
        courses.forEach((course) => {
          if (Array.isArray(course?.customers) && course?.customers.length) {
            conversionPayments +=
              course.customers.length * Number(course.price) * currentMonthsInQuarter;
          }
        });
      }

      const quarterlyCommission = (conversionPayments * affiliatePercentage) / 100;

      res.status(STATUS_CODES.OK).json({
        quarterlyCommission,
      });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to get the commission due to internal server error',
          error
        )
      );
    }
  };
}

export default new CourseController();
