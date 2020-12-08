import { body } from 'express-validator';

export function companyAndSchoolRules() {
  return [
    body('name', 'Name is required').notEmpty({ ignore_whitespace: true }),
    body('address', 'Address is required').notEmpty({ ignore_whitespace: true }),
    body('website', 'Website is required').notEmpty({ ignore_whitespace: true }),
    body('accountManagerName', 'Account manger name or title is required').notEmpty({
      ignore_whitespace: true,
    }),
    body('email', 'Valid email is required').isEmail().normalizeEmail(),
    body('phone', 'Valid phone number is required').matches(/^\+(?:[0-9] ?){6,14}[0-​9]$/),
  ];
}

export function companyAndSchoolUpdateRules() {
  return [
    body('name', 'Name is required').optional().notEmpty({ ignore_whitespace: true }),
    body('address', 'Address is required').optional().notEmpty({ ignore_whitespace: true }),
    body('website', 'Website is required').optional().notEmpty({ ignore_whitespace: true }),
    body('accountManagerName', 'Account manger name or title is required')
      .optional()
      .notEmpty({ ignore_whitespace: true }),
    body('email', 'Valid email is required').optional().isEmail().normalizeEmail(),
    body('phone', 'Valid phone number is required')
      .optional()
      .matches(/^\+(?:[0-9] ?){6,14}[0-​9]$/),
  ];
}
