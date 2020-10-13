import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { MODELS, STATUS_CODES } from '../constants';
import { ModelFactory } from '../models/model.factory';

/**
 * @function validate
 * @description middleware to validate passed rules
 * @param {any[]} validations - Validation rules
 * @return {object} errors
 */
export function validate(validations: any[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(STATUS_CODES.BAD_REQUEST).json({ errors: errors.array() });
  };
}

export function passwordValidator() {
  return [
    body('password', 'Password is required')
      .exists()
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/g)
      .withMessage(
        'Password must contain an uppercase, lowercase, numeric, special character (!@#$%^&*), and at least 8 characters'
      ),
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
      .custom((value) => {
        return userModel.findOne({ username: value }).then((user: object) => {
          if (user) {
            return Promise.reject('Username already exists');
          }
          return true;
        });
      }),
  ];
}

export function emailValidator() {
  const userModel = ModelFactory.getModel(MODELS.USER);
  return [
    body('email', 'Valid email is required')
      .isEmail()
      .normalizeEmail()
      .custom((value) => {
        return userModel.findOne({ email: value }).then((user: object) => {
          if (user) {
            return Promise.reject('Email already exists');
          }
          return true;
        });
      }),
  ];
}

export function registrationValidator() {
  return [...emailValidator(), ...usernameValidator(), ...passwordValidator()];
}
