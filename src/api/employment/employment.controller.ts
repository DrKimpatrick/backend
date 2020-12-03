import { Request, Response } from 'express';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES, USER_ROLES } from '../../constants';
import { logger } from '../../shared/winston';
import { EmploymentHistory } from '../../models/interfaces/employment.interface';

/**
 * @function EmploymentController
 * @description Handles all user related business logic
 *
 */

export class EmploymentController {
  addEmploymentHistory = async (
    req: Request,
    res: Response
  ): Promise<Response<{ message: string; data: EmploymentHistory }>> => {
    try {
      const id = req.currentUser?._id;
      const employmentHistory = req.currentUser?.employmentHistory;

      const { isCurrentPosition, endDate } = req.body;

      const userModel = ModelFactory.getModel(MODELS.USER);
      const employmentModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);

      const newEmployment: EmploymentHistory = await employmentModel.create({
        ...req.body,
        userId: id,
        endDate: isCurrentPosition && isCurrentPosition === true ? null : endDate,
      });

      if (employmentHistory) {
        await userModel.updateOne({ _id: id }, { $push: { employmentHistory: newEmployment._id } });
      } else {
        await userModel.updateOne(
          { _id: id },
          { $set: { employmentHistory: [newEmployment._id] } }
        );
      }

      return res
        .status(STATUS_CODES.CREATED)
        .json({ message: 'employment added', data: newEmployment });
    } catch (error) {
      console.log(error);
      logger.info(error);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ error: 'Something went wrong.' });
    }
  };

  listEmploymentHistory = async (
    req: Request,
    res: Response
  ): Promise<Response<{ data: EmploymentHistory[] }>> => {
    try {
      const id = req.currentUser?._id;

      const employmentModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);

      const getUserEmploymentHistory: EmploymentHistory[] = await employmentModel
        .find({
          userId: id,
        })
        .sort({ createdAt: -1 });

      return res.status(STATUS_CODES.OK).json({ data: getUserEmploymentHistory });
    } catch (error) {
      logger.info(error);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ error: 'something went wrong' });
    }
  };

  updateEmploymentHistory = async (
    req: Request,
    res: Response
  ): Promise<Response<{ message: string; data: EmploymentHistory }>> => {
    try {
      const { id } = req.params;

      let data: EmploymentHistory;

      const {
        isCurrentPosition,
        endDate,
        verificationStatus,
        skillsUsed,
        companyName,
        supervisor,
        title,
        responsibilities,
        accomplishments,
        startDate,
        favoriteProject,
      } = req.body;

      const employmentModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);

      const checkForAdmin = req.currentUser?.roles?.find((item) => item === USER_ROLES.SUPER_ADMIN);

      if (checkForAdmin) {
        data = await employmentModel.findOneAndUpdate(
          { _id: id },
          { $set: { verificationStatus } },
          { new: true, runValidators: true }
        );
      } else {
        data = await employmentModel.findOneAndUpdate(
          { $and: [{ _id: id }, { userId: req.currentUser?._id }] },
          {
            $set: {
              skillsUsed,
              companyName,
              supervisor,
              title,
              responsibilities,
              accomplishments,
              startDate,
              favoriteProject,
              isCurrentPosition,
              endDate: isCurrentPosition && isCurrentPosition === true ? null : endDate,
            },
          },
          { new: true }
        );
      }

      return res
        .status(STATUS_CODES.OK)
        .json({ data, message: data ? 'updated successfully' : 'failed to update. no data' });
    } catch (error) {
      logger.info(error);
      return res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ error: 'Unable to update data due to internal server error' });
    }
  };

  deleteEmploymentHistory = async (
    req: Request,
    res: Response
  ): Promise<Response<{ message: string }>> => {
    try {
      const { id } = req.params;

      const userId = req.currentUser?._id;

      const employmentModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);

      const userModel = ModelFactory.getModel(MODELS.USER);

      const data = await employmentModel.findOneAndDelete({
        $and: [{ _id: id }, { userId }],
      });

      // remove from user
      await userModel.updateOne(
        { _id: userId },
        // @ts-ignore
        { $pull: { employmentHistory: id } },
        { multi: true }
      );

      return res
        .status(STATUS_CODES.OK)
        .json({ message: data ? 'deleted successfully' : 'failed to delete data' });
    } catch (error) {
      logger.info(error);
      return res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ error: 'Unable to delete data due to internal server error' });
    }
  };

  listSpecificEmploymentHistory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const userId = req.currentUser?._id;

      const employmentModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);

      const getSpecificEmploymentHistory = await employmentModel.findOne({
        $and: [{ userId, _id: id }],
      });

      return res.status(STATUS_CODES.OK).json({ data: getSpecificEmploymentHistory });
    } catch (error) {
      logger.info(error);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ error: 'something went wrong' });
    }
  };

  changeEmploymentStatus = async (
    req: Request,
    res: Response
  ): Promise<Response<{ message: string; data: EmploymentHistory }>> => {
    try {
      const { id } = req.params;

      const { verificationStatus } = req.body;

      const employmentModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);

      const updateEmployment = await employmentModel.findByIdAndUpdate(
        { _id: id },
        { $set: { verificationStatus } },
        { new: true, runValidators: true }
      );

      if (!updateEmployment) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'employment not found' });
      }

      return res
        .status(STATUS_CODES.OK)
        .json({ data: updateEmployment, message: 'updated successfully' });
    } catch (error) {
      logger.info(error);
      return res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ message: 'unable to perform this action due to internal server error' });
    }
  };
}

const employmentController = new EmploymentController();

export default employmentController;
