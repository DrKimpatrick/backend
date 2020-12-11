import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { STATUS_CODES } from '../constants';

/**
 * @function validate
 * @description middleware to validate passed rules
 * @param {ValidationChain[]} validations - Validation rules
 */

export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: any = [];
    errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

    return res.status(STATUS_CODES.BAD_REQUEST).json({ errors: extractedErrors });
  };
}
