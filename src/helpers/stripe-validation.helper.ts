import { body } from 'express-validator';
import { FEATURE_CHOICE } from '../constants';

export function stripeSubscriptionRules() {
  return [
    body('paymentMethodId', 'paymentMethodId is required').isString().trim().notEmpty(),
    body('customerInfo.email', 'valid customer email required').trim().isEmail(),
    body('customerInfo.name', 'valid customer name required').isString().trim().notEmpty(),
    body('customerInfo.planId', 'valid customer planId required').isString().trim().notEmpty(),
    body('featureChoice', 'valid featureChoice required')
      .trim()
      .isString()
      .isIn(Object.values(FEATURE_CHOICE)),
  ];
}
