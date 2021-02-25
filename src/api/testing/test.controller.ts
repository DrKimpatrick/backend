import { Request, Response, NextFunction } from 'express';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES } from '../../constants';
import { HttpError } from '../../helpers/error.helpers';

/**
 * @function TestController
 * @description Handles all user related business logic
 *
 */

export class TestController {
  createTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const testModel = ModelFactory.getModel(MODELS.Test);

      const add = await testModel.create({ ...req.body });

      return res
        .status(STATUS_CODES.CREATED)
        .json({ message: 'test saved successfully', data: add });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to save test due to an internal server error'
        )
      );
    }
  };
}

export default new TestController();
