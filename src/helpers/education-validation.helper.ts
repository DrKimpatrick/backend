import { body } from 'express-validator';
import validator from 'validator';
import { isAfter, isValid } from 'date-fns';
import { SKILL_VERIFICATION_STATUS } from '../constants';

export const validateArrayOfStrings = (val: string[]) => {
  if (!Array.isArray(val)) return false;

  for (const v of val) {
    if (validator.isEmpty(v, { ignore_whitespace: true })) return false;
  }
  return val;
};

export function educationRules() {
  return [
    body('schoolName').notEmpty({ ignore_whitespace: true }),
    body('level').optional().notEmpty({ ignore_whitespace: true }),
    body('degreeOrCertification').optional().notEmpty({ ignore_whitespace: true }),
    body('specializations').optional().notEmpty({ ignore_whitespace: true }),
    body('isCurrentEducation').optional().isBoolean(),
    body('startDate')
      .matches(/^(19|20)\d\d[- \/](0[1-9]|1[012])[- \/](0[1-9]|[12][0-9]|3[01])$/)
      .withMessage('Start Date should be in the format YYYY-MM-DD or YYYY/MM/DD'),
    body('endDate')
      .optional()
      .matches(/^(19|20)\d\d[- \/](0[1-9]|1[012])[- \/](0[1-9]|[12][0-9]|3[01])$/)
      .withMessage('Start Date should be in the format YYYY-MM-DD or YYYY/MM/DD')
      .custom((val, { req }) => {
        if (!req.body.isCurrentEducation || req.body.isCurrentEducation === false) {
          const validateDate = isValid(new Date(val));

          if (!validateDate) {
            return Promise.reject('end date must be valid');
          }

          if (validateDate && !isAfter(new Date(val), new Date(req.body.startDate))) {
            return Promise.reject('end date must be greater than start date');
          }
        }
        return true;
      }),
    body('accomplishments')
      .optional()
      .custom(validateArrayOfStrings)
      .withMessage('Accomplishments should be an array of strings'),
    body('verificationStatus').optional().isIn(Object.values(SKILL_VERIFICATION_STATUS)),
  ];
}

export function educationUpdateRules() {
  return [
    body('schoolName').optional().notEmpty({ ignore_whitespace: true }),
    body('level').optional().notEmpty({ ignore_whitespace: true }),
    body('degreeOrCertification').optional().notEmpty({ ignore_whitespace: true }),
    body('specializations').optional().notEmpty({ ignore_whitespace: true }),
    body('isCurrentEducation').optional().isBoolean(),
    body('startDate')
      .optional()
      .matches(/^(19|20)\d\d[- \/](0[1-9]|1[012])[- \/](0[1-9]|[12][0-9]|3[01])$/)
      .withMessage('Start Date should be in the format YYYY-MM-DD or YYYY/MM/DD'),
    body('endDate')
      .optional()
      .matches(/^(19|20)\d\d[- \/](0[1-9]|1[012])[- \/](0[1-9]|[12][0-9]|3[01])$/)
      .withMessage('Start Date should be in the format YYYY-MM-DD or YYYY/MM/DD')
      .custom((val, { req }) => {
        if (!req.body.isCurrentEducation || req.body.isCurrentEducation === false) {
          const validateDate = isValid(new Date(val));

          if (!validateDate) {
            return Promise.reject('end date must be valid');
          }

          if (validateDate && !isAfter(new Date(val), new Date(req.body.startDate))) {
            return Promise.reject('end date must be greater than start date');
          }
        }
        return true;
      }),
    body('accomplishments')
      .optional()
      .custom(validateArrayOfStrings)
      .withMessage('Accomplishments should be an array of strings'),
    body('verificationStatus').optional().isIn(Object.values(SKILL_VERIFICATION_STATUS)),
  ];
}
