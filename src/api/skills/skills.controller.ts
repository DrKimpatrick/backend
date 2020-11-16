import { Request, Response } from 'express';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES } from '../../constants';
import { logger } from '../../shared/winston';
import { IUserSkill } from '../../interfaces';

export async function checkMissingExist(skillIds: string[]) {
  const skillModel = ModelFactory.getModel(MODELS.SKILLS);
  let records = await skillModel.find().where('_id').in(skillIds).select('_id').exec();
  records = records.map((x) => x._id.toString());
  const notFound = skillIds.filter((id: string) => !records.includes(id));
  const found = skillIds.filter((id: string) => records.includes(id));
  if (notFound.length > 0) {
    return { notFound, found: null };
  }
  return { found, notFound: null };
}

export async function createSkills(rawSkills: IUserSkill[], userId: string) {
  let skills = rawSkills || [];
  // START: check if skills provided exist
  const skillIds = skills.map((x) => x.skill);
  const { notFound, found } = await checkMissingExist(skillIds);
  if (notFound && notFound.length > 0) {
    // may be create the non existing skills here, a feature to be added later if needed
    throw new Error(`Skills '${notFound}', could not be found`);
  }
  // END: check if skills provided exist

  // only save skills that exist
  skills = skills.filter((x) => found?.includes(x.skill));
  // attach skill to current user
  skills = skills.map((x) => ({ ...x, user: userId }));

  const userSkillModel = ModelFactory.getModel(MODELS.USER_SKILLS);
  await userSkillModel.create(skills);
  return userSkillModel.find({ user: userId }).populate('skill').select('-user').exec();
}

/**
 * @function UserController
 * @description Handles all user related business logic
 *
 */
export class SkillsController {
  createSkills = async (req: Request, res: Response) => {
    try {
      let skills = req.body || [];
      // make sure we dont save unwanted fields
      skills = skills.map((x: Record<string, unknown>) => ({ skill: x.skill }));

      const skillModel = ModelFactory.getModel(MODELS.SKILLS);
      const data = await skillModel.create(skills);

      return res.status(STATUS_CODES.CREATED).json({ data });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: e.message });
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
      const userSkillModel = ModelFactory.getModel(MODELS.USER_SKILLS);
      const data = await skillModel.findByIdAndDelete(skillId).exec();

      // remove this skill from all models that had it
      await userSkillModel.deleteMany({ skill: data.id.toString() });

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

      const update = req.body || {};

      const data = await skillModel.findByIdAndUpdate(skillId, update, { new: true }).exec();

      return res.status(STATUS_CODES.OK).json({ data });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Server Error' });
    }
  };

  fetchUserSkills = async (req: Request, res: Response) => {
    try {
      const userId = req.currentUser?.id;
      const userModel = ModelFactory.getModel(MODELS.USER_SKILLS);
      const data = await userModel.find({ user: userId }).populate('skill').select('-user').exec();

      return res.json({ data });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: e.message });
    }
  };

  createUserSkills = async (req: Request, res: Response) => {
    try {
      const skills: IUserSkill[] = req.body;
      const userId = req.currentUser?.id as string;

      // START: check if skills provided exist
      const data = await createSkills(skills, userId);

      const status = skills.length > 0 ? STATUS_CODES.CREATED : STATUS_CODES.OK;

      return res.status(status).json({ data });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: e.message });
    }
  };

  updateUserSkills = async (req: Request, res: Response) => {
    try {
      const skills = req.body || [];

      const getUpdateDoc = (doc: Record<string, string>) => {
        const update: Record<string, string> = {};
        if (doc.level) {
          update.level = doc.level;
        }
        if (doc.verificationStatus) {
          update.verificationStatus = doc.verificationStatus;
        }
        return update;
      };

      const userSkillModel = ModelFactory.getModel(MODELS.USER_SKILLS);

      // START: make sure user only updates his skills
      let userSkills = await userSkillModel
        .find({ user: req.currentUser?.id })
        .select('_id')
        .exec();
      userSkills = userSkills.map((x: Record<string, string>) => x.id.toString());
      const updateIds = skills.map((x: Record<string, string>) => x.userSkill.toString());
      const notFound = updateIds.filter((id: string) => !userSkills.includes(id));
      if (notFound.length > 0) {
        return res.status(STATUS_CODES.FORBIDDEN).send({
          message: `You are not allowed to updated Skills(s) '${notFound}`,
          data: null,
        });
      }
      // END: make sure user only updates his skills

      const data = [];
      for (const skill of skills) {
        const xj = await userSkillModel
          .findByIdAndUpdate(skill.userSkill, getUpdateDoc(skill), { new: true })
          .exec();
        if (xj) {
          data.push(xj);
        }
      }

      return res.json({ data });
    } catch (e) {
      logger.info(e);
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Server Error' });
    }
  };
}

const skillController = new SkillsController();

export default skillController;
