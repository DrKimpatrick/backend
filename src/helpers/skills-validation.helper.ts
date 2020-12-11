import { body } from 'express-validator';
import { SKILL_LEVEL, SKILL_VERIFICATION_STATUS } from '../constants';

export function skillsRules() {
  return [body('*.skill', 'Skill name must not be empty').notEmpty({ ignore_whitespace: true })];
}

export function skillsUpdateRules() {
  return [
    body('skill', 'Skill name must not be empty').optional().notEmpty({ ignore_whitespace: true }),
  ];
}

export function userSkillsRules() {
  return [
    body('*.skill', 'Skill must be a valid ID').isMongoId(),
    body('*.level', 'Value not allowed').optional().isIn(Object.values(SKILL_LEVEL)),
    body('*.verificationStatus').optional().isIn(Object.values(SKILL_VERIFICATION_STATUS)),
  ];
}

export function userSkillsUpdateRules() {
  return [
    body('*.userSkill', 'User Skill must be a valid ID').isMongoId(),
    body('*.level', 'Value not allowed').optional().isIn(Object.values(SKILL_LEVEL)),
    body('*.verificationStatus').optional().isIn(Object.values(SKILL_VERIFICATION_STATUS)),
  ];
}

export function userSkillsDeleteRules() {
  return [
    body('*', 'User Skill must be a valid ID').isMongoId(),
  ];
}
