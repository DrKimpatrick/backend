import { body } from 'express-validator';
import validator from 'validator';
import { FEATURE_CHOICE, PAYMENT_STATUS, SKILL_VERIFICATION_STATUS } from '../constants';

export const validateArrayOfStrings = (val: string[]) => {
  if (!Array.isArray(val)) return false;

  for (const v of val) {
    if (validator.isEmpty(v, { ignore_whitespace: true })) return false;
  }
  return val;
};

export function userProfileRules() {
  return [
    body('role', 'Role must have a value').optional().notEmpty({ ignore_whitespace: true }),
    body('featureChoice', 'This field must have a value')
      .optional()
      .isIn([FEATURE_CHOICE.BASIC, FEATURE_CHOICE.STANDARD, FEATURE_CHOICE.PREMIUM]),
    body('paymentStatus', 'This field must have a value')
      .optional()
      .isIn([PAYMENT_STATUS.CONFIRMED, PAYMENT_STATUS.FAILED, PAYMENT_STATUS.UNPAID]),
    body('verified', 'Must be a boolean').optional().isBoolean(),
    body('firstName').optional().notEmpty({ ignore_whitespace: true }),
    body('lastName').optional().notEmpty({ ignore_whitespace: true }),
    body('email').optional().isEmail(),

    // validate skills
    body('skills.*').isMongoId().withMessage('skills must have valid IDs'),

    // validate Employment History
    body('employmentHistory.*.action').exists().isIn(['update', 'create', 'delete']),
    body('employmentHistory.*.companyName', 'Company Name must not be empty').notEmpty({
      ignore_whitespace: true,
    }),
    body('employmentHistory.*.supervisor', 'Supervisor is not provided')
      .optional()
      .notEmpty({ ignore_whitespace: true }),
    body('employmentHistory.*.title', 'Title is not provided').notEmpty({
      ignore_whitespace: true,
    }),
    body('employmentHistory.*.startDate')
      .matches(/^(19|20)\d\d[- \/](0[1-9]|1[012])[- \/](0[1-9]|[12][0-9]|3[01])$/)
      .withMessage('Start Date should be in the format YYYY-MM-DD or YYYY/MM/DD'),
    body('employmentHistory.*.endDate')
      .matches(/^(19|20)\d\d[- \/](0[1-9]|1[012])[- \/](0[1-9]|[12][0-9]|3[01])$/)
      .withMessage('Start Date should be in the format YYYY-MM-DD or YYYY/MM/DD'),
    body('employmentHistory.*.skillsUsed')
      .optional()
      .custom(validateArrayOfStrings)
      .withMessage('Skills Used should be an array of valid Ids'),
    body('employmentHistory.*.responsibilities')
      .optional()
      .custom(validateArrayOfStrings)
      .withMessage('Responsibilities should be an array of valid Ids'),
    body('employmentHistory.*.accomplishments')
      .optional()
      .custom(validateArrayOfStrings)
      .withMessage('Accomplishments should be an array of strings'),
    body('employmentHistory.*.favoriteProject').optional().notEmpty({ ignore_whitespace: true }),
    body('employmentHistory.*.verificationStatus')
      .optional()
      .isIn([
        SKILL_VERIFICATION_STATUS.UNVERIFIED,
        SKILL_VERIFICATION_STATUS.IN_PROGRESS,
        SKILL_VERIFICATION_STATUS.VERIFIED,
      ]),

    // validate Education History
    body('educationHistory.*.schoolName').notEmpty({ ignore_whitespace: true }),
    body('educationHistory.*.level').optional().notEmpty({ ignore_whitespace: true }),
    body('educationHistory.*.degreeOrCertification')
      .optional()
      .notEmpty({ ignore_whitespace: true }),
    body('educationHistory.*.specializations').optional().notEmpty({ ignore_whitespace: true }),
    body('educationHistory.*.startDate')
      .matches(/^(19|20)\d\d[- \/](0[1-9]|1[012])[- \/](0[1-9]|[12][0-9]|3[01])$/)
      .withMessage('Start Date should be in the format YYYY-MM-DD or YYYY/MM/DD'),
    body('educationHistory.*.endDate')
      .matches(/^(19|20)\d\d[- \/](0[1-9]|1[012])[- \/](0[1-9]|[12][0-9]|3[01])$/)
      .withMessage('Start Date should be in the format YYYY-MM-DD or YYYY/MM/DD'),
    body('educationHistory.*.accomplishments')
      .optional()
      .custom(validateArrayOfStrings)
      .withMessage('Accomplishments should be an array of strings'),
    body('educationHistory.*.verificationStatus')
      .optional()
      .isIn([
        SKILL_VERIFICATION_STATUS.UNVERIFIED,
        SKILL_VERIFICATION_STATUS.IN_PROGRESS,
        SKILL_VERIFICATION_STATUS.VERIFIED,
      ]),
  ];
}

export const courseValidator = () => {
  return [
    body('instructor', 'Instructor is required').not().isEmpty().trim().escape(),
    body('name', 'Name is required').not().isEmpty().trim().escape(),
    body('languageTaught', 'Language is required').not().isEmpty().trim().escape(),
    body('existingCourseLink', 'Course link is required').not().isEmpty().trim().escape(),
    body('currentLangSpecsUpdated', 'Current lang is required').isBoolean(),
    body('coverImageLink', 'Cover image is required').not().isEmpty().trim().escape(),
  ];
};
