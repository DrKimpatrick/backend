import { body } from 'express-validator';
import validator from 'validator';
import {
  FEATURE_CHOICE,
  PAYMENT_STATUS,
  SKILL_LEVEL,
  SKILL_VERIFICATION_STATUS,
  USER_ROLES,
  TalentProcess,
  AdminsProcess,
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
    body('roles', 'Role must have a value')
      .optional()
      .custom((value) => {
        if (!Array.isArray(value)) {
          return Promise.reject('roles should be an array');
        }
        if (value.length > 1) {
          return Promise.reject(`One role is allowed for a user, you provided ${value.length}`);
        }
        const options = Object.values(USER_ROLES);
        for (const val of value) {
          if (!options.includes(val)) {
            return Promise.reject(`Role:'${val}', is not allowed`);
          }
        }
        return true;
      }),
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

    body('profileProcess').custom((val, { req }) => {
      if (!val) {
        return true;
      }
      if (req.currentUser && req.currentUser.roles && req.currentUser.roles.length > 0) {
        const { roles } = req.currentUser;

        for (let i = 0; i <= roles.length; i++) {
          switch (roles[i]) {
            case USER_ROLES.TALENT:
              if (
                req.currentUser.profileProcess &&
                req.currentUser.profileProcess === TalentProcess.Completed
              ) {
                return Promise.reject('You have completed signup process');
              }

              if (!Object.values(TalentProcess).includes(val)) {
                return Promise.reject(`The provided step (${val}) does not exist`);
              }
              return true;
            case USER_ROLES.RECRUITMENT_ADMIN:
            case USER_ROLES.HR_ADMIN:
            case USER_ROLES.COMPANY_ADMIN:
            case USER_ROLES.TRAINNING_ADMIN:
            case USER_ROLES.EDUCATION:
              if (
                req.currentUser.profileProcess &&
                req.currentUser.profileProcess === AdminsProcess.Completed
              ) {
                return Promise.reject('You have completed signup process');
              }

              if (!Object.values(AdminsProcess).includes(val)) {
                return Promise.reject(`The provided step (${val}) does not exist`);
              }
              return true;
            default:
              return Promise.reject('Failed to validate step');
          }
        }
      }
      return Promise.reject('Failed to validate step');
    }),
    body('profilePicture')
      .custom((val) => {
        if (
          typeof val !== 'string' ||
          validator.isEmpty(val, { ignore_whitespace: true }) ||
          !validator.isURL(val)
        ) {
          return Promise.reject('profile picture must be valid');
        }
        return true;
      })
      .optional(),
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

export const verificationStatusRule = () => {
  return [
    body('verificationStatus').notEmpty().withMessage('status is required'),
    body('verificationStatus')
      .isIn(Object.values(SKILL_VERIFICATION_STATUS))
      .withMessage('Status should be verified, unverified or inProgress'),
  ];
};
