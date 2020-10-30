import { Request, Response } from 'express';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES } from '../../constants';
import { logger } from '../../shared/winston';

/**
 * @function UserController
 * @description Handles all user related business logic
 *
 */
export class SkillsController {
  createSkills = async (req: Request, res: Response) => {
    try {
      const skills = req.body;
      const skillModel = ModelFactory.getModel(MODELS.SKILLS);
      const data = await skillModel.create(skills);

      return res.json({ data });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Server Error' });
    }
  };

  fetchSkills = async (req: Request, res: Response) => {
    try {
      const skillId = req.params.id;
      const skillModel = ModelFactory.getModel(MODELS.SKILLS);
      let data;
      if (skillId) {
        data = await skillModel.findById(skillId).exec();
      } else {
        data = await skillModel.find().exec();
      }

      return res.json({ data });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Server Error' });
    }
  };

  deleteSkills = async (req: Request, res: Response) => {
    try {
      const skillId = req.params.id;
      const skillModel = ModelFactory.getModel(MODELS.SKILLS);
      const data = await skillModel.findByIdAndDelete(skillId).exec();

      return res.status(STATUS_CODES.NO_CONTENT).json({ data });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Server Error' });
    }
  };

  updateSkills = async (req: Request, res: Response) => {
    try {
      const skillId = req.params.id;
      const skillModel = ModelFactory.getModel(MODELS.SKILLS);
      const update: Record<string, any> = {};
      if (req.body.skill) {
        update.skill = req.body.skill;
      }
      if (req.body.level) {
        update.level = req.body.level;
      }
      if (req.body.verificationStatus) {
        update.verificationStatus = req.body.verificationStatus;
      }
      const data = await skillModel.findByIdAndUpdate(skillId, update, { new: true }).exec();

      return res.status(STATUS_CODES.OK).json({ data });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Server Error' });
    }
  };
}

const skillController = new SkillsController();

export default skillController;
