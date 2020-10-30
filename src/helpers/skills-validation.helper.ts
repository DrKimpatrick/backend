import { body } from 'express-validator';
import { SKILL_LEVEL, SKILL_VERIFICATION_STATUS } from '../constants';

export function skillsRules() {
  return [
    body('skill', 'Skill name must not be empty').notEmpty({ ignore_whitespace: true }),
    body('level', 'Value not allowed').optional().isIn(Object.values(SKILL_LEVEL)),
    body('verificationStatus').optional().isIn(Object.values(SKILL_VERIFICATION_STATUS)),
  ];
}
