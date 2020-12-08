import { Request, Response } from 'express';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES } from '../../constants';
import { logger } from '../../shared/winston';

export class SchoolController {
  create = async (req: Request, res: Response) => {
    try {
      const userId = req.currentUser?.id;
      const userModel = ModelFactory.getModel(MODELS.USER);
      const schoolModel = ModelFactory.getModel(MODELS.SCHOOL);
      const newSchool = await schoolModel.create({
        ...req.body,
        userId,
      });
      await userModel.findByIdAndUpdate(
        userId,
        { $push: { schools: newSchool._id } },
        { new: true }
      );
      newSchool.__v = undefined;
      return res
        .status(STATUS_CODES.CREATED)
        .json({ message: 'School added successfully', data: newSchool });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Server Error' });
    }
  };

  schoolById = async (id: string) => {
    try {
      const schoolModel = ModelFactory.getModel(MODELS.SCHOOL);
      const school = await schoolModel.findById(id).select('-__v').exec();
      if (!school) {
        throw new Error('School not found');
      }
      return school;
    } catch (e) {
      throw new Error('Could not find this school');
    }
  };

  getOne = async (req: Request, res: Response) => {
    try {
      const school = await this.schoolById(req.params.id);
      return res.status(STATUS_CODES.OK).json({ data: school });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: e.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const school = await this.schoolById(req.params.id);
      const userId = req.currentUser?.id;
      if (school.userId.toString() !== userId?.toString() && !req.currentUser?.isSuperAdmin) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          error: 'You are not authorized to update this school',
        });
      }
      delete req.body?.userId;
      const schoolModel = ModelFactory.getModel(MODELS.SCHOOL);
      const updatedSchool = await schoolModel
        .findByIdAndUpdate(school?._id, { ...req.body }, { new: true })
        .exec();
      updatedSchool.__v = undefined;
      return res.status(STATUS_CODES.OK).json({ data: updatedSchool });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: e.message });
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      const school = await this.schoolById(req.params.id);
      const userId = req.currentUser?.id;
      if (school.userId.toString() !== userId?.toString() && !req.currentUser?.isSuperAdmin) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          error: 'You are not authorized to delete this school',
        });
      }
      const userModel = ModelFactory.getModel(MODELS.USER);
      const schoolModel = ModelFactory.getModel(MODELS.SCHOOL);
      const data = await schoolModel.findByIdAndDelete(school._id).exec();
      await userModel.findByIdAndUpdate(
        school.userId,
        {
          $pull: { schools: school._id.toString() },
        },
        { new: true }
      );

      return res.status(STATUS_CODES.NO_CONTENT).json({ data });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: e.message });
    }
  };
}

const schoolController = new SchoolController();

export default schoolController;
