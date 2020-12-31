import { body } from 'express-validator';
import validator from 'validator';
import { AdminsProcess, FEATURE_CHOICE, TalentProcess } from '../constants';

export function stripeSubscriptionRules() {
  return [
    body('paymentMethodId', 'paymentMethodId is required').isString().trim().notEmpty(),
    body('customerInfo.email', 'valid customer email required').trim().isEmail(),
    body('customerInfo.name', 'valid customer name required').isString().trim().notEmpty(),
    body('customerInfo.planId', 'valid customer planId required').isString().trim().notEmpty(),
    body('featureChoice', 'valid featureChoice required')
      .optional()
      .trim()
      .isString()
      .isIn(Object.values(FEATURE_CHOICE)),
    body('profileProcess', 'valid profileProcess required')
      .trim()
      .isIn([TalentProcess.Completed, AdminsProcess.Completed]),
    body('coupon', 'A valid coupon Id id required')
      .optional()
      .notEmpty({ ignore_whitespace: true }),
    body('subsidy', 'valid subsidy detail id not provided')
      .optional()
      .custom((val) => {
        const proxy = Object.prototype.hasOwnProperty;

        if (
          !proxy.call(val, 'quantity') ||
          !proxy.call(val, 'planId') ||
          !proxy.call(val, 'tier')
        ) {
          throw new Error('Make sure subsidy has the properties `quantity, tier, planId`');
        }
        if (!validator.isInt(val.quantity.toString())) {
          throw new Error('subsidy.quantity must be a valid integer');
        }
        if (validator.isEmpty(validator.trim(val.planId.toString()))) {
          throw new Error('subsidy.planId must be a valid planId');
        }
        if (!proxy.call(val.tier, 'unit_amount')) {
          throw new Error('subsidy.tier has not attribute unit_amount');
        }
        return val;
      }),
  ];
}
