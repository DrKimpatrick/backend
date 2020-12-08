import { Request, Response } from 'express';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES } from '../../constants';
import { logger } from '../../shared/winston';

export class CompanyController {
  create = async (req: Request, res: Response) => {
    try {
      const userId = req.currentUser?.id;

      const userModel = ModelFactory.getModel(MODELS.USER);
      const companyModel = ModelFactory.getModel(MODELS.COMPANY);

      const newCompany = await companyModel.create({
        ...req.body,
        userId,
      });
      await userModel.findByIdAndUpdate(
        userId,
        { $push: { companies: newCompany._id } },
        { new: true }
      );

      newCompany.__v = undefined;

      return res
        .status(STATUS_CODES.CREATED)
        .json({ message: 'company added successfully', data: newCompany });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Server Error' });
    }
  };

  companyById = async (id: string) => {
    try {
      const companyModel = ModelFactory.getModel(MODELS.COMPANY);
      const company = await companyModel.findById(id).select('-__v').exec();
      if (!company) {
        throw new Error('Company not found');
      }
      return company;
    } catch (e) {
      throw new Error('Could not find this company');
    }
  };

  getOne = async (req: Request, res: Response) => {
    try {
      const company = await this.companyById(req.params.id);
      return res.status(STATUS_CODES.OK).json({ data: company });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: e.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const company = await this.companyById(req.params.id);
      const userId = req.currentUser?.id;

      if (company.userId.toString() !== userId?.toString() && !req.currentUser?.isSuperAdmin) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          error: 'You are not authorized to update this company',
        });
      }
      delete req.body?.userId;
      const companyModel = ModelFactory.getModel(MODELS.COMPANY);

      const updatedCompany = await companyModel
        .findByIdAndUpdate(company._id, { ...req.body }, { new: true })
        .exec();

      updatedCompany.__v = undefined;

      return res.status(STATUS_CODES.OK).json({ data: updatedCompany });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: e.message });
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      const company = await this.companyById(req.params.id);
      const userId = req.currentUser?.id;

      if (company.userId.toString() !== userId?.toString() && !req.currentUser?.isSuperAdmin) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          error: 'You are not authorized to delete this company',
        });
      }
      const userModel = ModelFactory.getModel(MODELS.USER);
      const companyModel = ModelFactory.getModel(MODELS.COMPANY);
      const data = await companyModel.findByIdAndDelete(company._id).exec();
      await userModel.findByIdAndUpdate(
        company.userId,
        {
          $pull: { companies: company._id.toString() },
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

const companyController = new CompanyController();

export default companyController;
