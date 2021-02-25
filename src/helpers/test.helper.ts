import { body } from 'express-validator';
import { TimePolicy } from '../constants';

export class TestHelper {
  createTestRule = () => {
    return [
      body('name', 'name is required').notEmpty(),
      body('name').isLength({ min: 3 }).withMessage('name must be more than 3 characters'),
      body('description').notEmpty().withMessage('description is required'),
      body('description')
        .isLength({ min: 4 })
        .withMessage('description must be more than 4 character'),
      body('timePolicy').notEmpty().withMessage('time policy is required'),
      body('timePolicy').custom((val) => {
        const policy = Object.values(TimePolicy);

        if (!val) {
          return Promise.reject(`time policy must be one from list (${policy})`);
        }

        if (val && !policy.includes(val)) {
          return Promise.reject(`time policy must be one from list (${policy})`);
        }

        return true;
      }),
    ];
  };
}

export default new TestHelper();
