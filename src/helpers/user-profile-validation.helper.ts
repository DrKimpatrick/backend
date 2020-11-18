import { body } from 'express-validator';
import validator from 'validator';
import { isValid, isAfter } from 'date-fns';
import {
  FEATURE_CHOICE,
  PAYMENT_STATUS,
  SKILL_LEVEL,
  SKILL_VERIFICATION_STATUS,
} from '../constants';

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
    body('skills.*.skill').isMongoId().withMessage('skills must have valid IDs'),
    body('skills.*.level', 'Value not allowed').optional().isIn(Object.values(SKILL_LEVEL)),
    body('skills.*.verificationStatus').optional().isIn(Object.values(SKILL_VERIFICATION_STATUS)),

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

export const courseValidator = () => [
  body('instructor', 'Instructor is required').not().isEmpty(),
  body('name', 'Name is required').not().isEmpty(),
  body('languageTaught', 'Language is required').not().isEmpty(),
  body('existingCourseLink', 'Course link is required').not().isEmpty(),
  body('currentLangSpecsUpdated', 'Current lang is required').isBoolean(),
  body('coverImageLink', 'Cover image must is required').not().isEmpty(),
  body('coverImageLink', 'Cover image must be valid link').matches(
    /(^http[s]?:\/{2})|(^www)|(^\/{1,2})$/
  ),
  body('existingCourseLink', 'Course link must be valid link').matches(
    /(^http[s]?:\/{2})|(^www)|(^\/{1,2})$/
  ),
];

export const employmentHistoryRules = () => [
  body('companyName').not().isEmpty().trim().escape().withMessage('company name is required'),
  body('supervisor').not().isEmpty().trim().escape().withMessage('supervisor is required'),
  body('title').not().isEmpty().trim().escape().withMessage('title is required'),
  body('title').isLength({ min: 3 }).withMessage('title must be more than 3 characters'),
  body('startDate').not().isEmpty().withMessage('start date is required'),
  body('startDate').isISO8601().toDate().withMessage('start date must be valid'),
  body('companyName').isString().withMessage('company name should be string'),
  body('supervisor').isString().withMessage('supervisor should be string'),
  body('title').isString().withMessage('title should be string'),
  body('skillsUsed')
    .custom((val) => {
      if (!val) {
        return true;
      }

      if (validateArrayOfStrings(val)) {
        return true;
      }
      return Promise.reject('skills should be array of strings');
    })
    .optional(),
  body('endDate').custom((val, { req }) => {
    if (!req.body.isCurrentPosition || req.body.isCurrentPosition === false) {
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
  body('responsibilities')
    .optional()
    .custom((val) => {
      if (!val) {
        return true;
      }

      if (validateArrayOfStrings(val)) {
        return true;
      }
      return Promise.reject('responsibilities should be array of strings');
    }),
  body('accomplishments')
    .custom((val) => {
      if (!val) {
        return true;
      }

      if (validateArrayOfStrings(val)) {
        return true;
      }
      return Promise.reject('accomplishment should be array of strings');
    })
    .optional(),
];
