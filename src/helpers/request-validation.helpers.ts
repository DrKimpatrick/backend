import { body } from 'express-validator';
import { MODELS, USER_ROLES } from '../constants';
import IBetaTester from '../models/interfaces/beta-tester.interface';
import { ModelFactory } from '../models/model.factory';

export function passwordValidator() {
  return [
    body('password', 'Password is required')
      .exists()
      .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#])([a-zA-Z0-9@$!%*?&#]{8,})$/)
      .withMessage(
        'Password must be at least 8 character long and contain at least one uppercase, lowercase, numeric and a special character (@$!%*?&#)'
      ),
  ];
}

export function confirmPasswordValidator() {
  return [
    body('confirm-password').custom(async (confirmPassword, { req }) => {
      const { password } = req.body;
      if (password !== confirmPassword) {
        throw new Error('Password does not match');
      }
    }),
  ];
}

export function usernameValidator() {
  const userModel = ModelFactory.getModel(MODELS.USER);
  return [
    body('username')
      .optional()
      .matches(/^[a-z0-9]{5,}$/)
      .withMessage(
        'Username must be a lowercase word with at least 5 character long with no special characters'
      )
      .custom((value) =>
        userModel.findOne({ username: value }).then((user: object) => {
          if (user) {
            return Promise.reject('Username already exists');
          }
          return true;
        })
      ),
  ];
}

export function emailValidator() {
  const userModel = ModelFactory.getModel(MODELS.USER);
  return [
    body('email', 'Valid email is required')
      .isEmail()
      .normalizeEmail()
      .custom((value) =>
        userModel.findOne({ email: value }).then((user: object) => {
          if (user) {
            return Promise.reject('Email already exists');
          }
          return true;
        })
      ),
  ];
}

export function roleValidator() {
  const validRoles = Object.values(USER_ROLES).filter((role) => role !== USER_ROLES.SUPER_ADMIN);
  return [
    body('role', 'Valid user role is required')
      .exists()
      .isIn(validRoles)
      .withMessage(
        'Role must be one of the valid user roles (talent, education, recruitment_admin, hr_admin, company_admin, training_admin, training_affiliate)'
      ),
  ];
}

export function registrationRules() {
  return [...emailValidator(), ...usernameValidator(), ...passwordValidator()];
}

export function newBetaTesterRules() {
  const betaTestersModel = ModelFactory.getModel<IBetaTester>(MODELS.BETA_TESTER);
  return [
    body('email', 'Valid email is required')
      .isEmail()
      .normalizeEmail()
      .custom((value) =>
        betaTestersModel.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject('This email address is already part of the beta programme');
          }
          return true;
        })
      ),
    body('name', 'name must have a value').notEmpty({ ignore_whitespace: true }),
    body('accountType', 'accountType must have a value')
      .notEmpty({ ignore_whitespace: true })
      .isIn(['company', 'school', 'talent'])
      .withMessage('accountType must be one of the following: (company, school, talent)'),
  ];
}
