import { body } from 'express-validator';
import validator from 'validator';
import { isValid, isAfter } from 'date-fns';
import { Supervisor, EmploymentReference, EmploymentType } from '../constants';
import { validateArrayOfStrings } from './user-profile-validation.helper';

const regInternationalPhone = /^\+(?:[0-9] ?){6,14}[0-​9]$/;

export const employmentHistoryRules = () => [
  body('companyName').notEmpty().trim().escape().withMessage('company name is required'),
  body('title').not().isEmpty().trim().escape().withMessage('title is required'),
  body('title').isLength({ min: 3 }).withMessage('title must be more than 3 characters'),
  body('startDate').not().isEmpty().withMessage('start date is required'),
  body('startDate').isISO8601().toDate().withMessage('start date must be valid'),
  body('companyName').isString().withMessage('company name should be string'),
  body('supervisor')
    .custom((val) => {
      if (val && typeof val === 'object' && Object.keys(val).length > 0) {
        if (!('name' in val)) {
          return Promise.reject('supervisor name is required');
        }

        if (!Object.values(Supervisor).includes(val.name)) {
          return Promise.reject('supervisor name should either be staffing, employee or HR');
        }

        if (!('detail' in val) || (val.detail && typeof val.detail !== 'object')) {
          return Promise.reject('supervisor detail (name, email and phone number) is required');
        }

        if (!('name' in val.detail) || !('email' in val.detail) || !('phoneNumber' in val.detail)) {
          return Promise.reject('supervisor detail should contain name, email and phone number');
        }

        if (validator.isEmpty(val.detail.name, { ignore_whitespace: true })) {
          return Promise.reject('supervisor detail (name) is required');
        }

        if (
          validator.isEmpty(val.detail.email, { ignore_whitespace: true }) ||
          !validator.isEmail(val.detail.email)
        ) {
          return Promise.reject('supervisor detail (email) must be valid');
        }

        if (
          validator.isEmpty(val.detail.phoneNumber, { ignore_whitespace: true }) ||
          !validator.matches(val.detail.phoneNumber, regInternationalPhone)
        ) {
          return Promise.reject('supervisor detail (phone) must be valid. Ex: +14155552671');
        }
        return true;
      }
      if (!val) {
        return true;
      }
      return Promise.reject('supervisor should contain name and detail');
    })
    .optional(),
  body('title').isString().withMessage('title should be string'),
  body('skillsUsed')
    .custom((val) => {
      if (!val) {
        return true;
      }

      if (validateArrayOfStrings(val)) {
        return true;
      }
      return Promise.reject('skills should contain list of data');
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

  body('reference')
    .custom((val) => {
      if (!val) {
        return true;
      }
      if (val && typeof val === 'object' && Object.keys(val).length > 0) {
        if (!('name' in val)) {
          return Promise.reject('reference is required');
        }

        if (!Object.values(EmploymentReference).includes(val.name)) {
          return Promise.reject(
            `reference type should either be [${Object.values(EmploymentReference)}]`
          );
        }

        if (!('detail' in val) || (val.detail && typeof val.detail !== 'object')) {
          return Promise.reject(`reference detail [name, email and phone number] is required`);
        }

        if (!('name' in val.detail) || !('email' in val.detail) || !('phoneNumber' in val.detail)) {
          return Promise.reject(`reference detail should contain [name, email, and phone number]`);
        }

        if (validator.isEmpty(val.detail.name, { ignore_whitespace: true })) {
          return Promise.reject('reference detail (name) is required');
        }

        if (
          validator.isEmpty(val.detail.email, { ignore_whitespace: true }) ||
          !validator.isEmail(val.detail.email)
        ) {
          return Promise.reject('reference detail (email) must be valid');
        }

        if (
          validator.isEmpty(val.detail.phoneNumber, { ignore_whitespace: true }) ||
          !validator.matches(val.detail.phoneNumber, regInternationalPhone)
        ) {
          return Promise.reject('reference detail (phone) must be valid. Ex: +14155552671');
        }
        return true;
      }
      return Promise.reject('reference should contain type and detail');
    })
    .optional(),

  body('employmentType').notEmpty().withMessage('employment type is required'),
  body('employmentType')
    .isIn(Object.values(EmploymentType))
    .withMessage(`employment type should be ${Object.values(EmploymentType)}`),
];
