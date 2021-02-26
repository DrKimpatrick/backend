import { Request, Response, NextFunction } from 'express';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES } from '../../constants';
import { HttpError } from '../../helpers/error.helpers';

/**
 * @function QuestionController
 * @description Handles all question related business logic
 *
 */

export class QuestionController {
  createMultipleChoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const questionModel = ModelFactory.getModel(MODELS.Question);
      const testModel = ModelFactory.getModel(MODELS.Test);
      const { testId } = req.body;

      const addQuestion = await questionModel.create({ ...req.body });

      await testModel.findByIdAndUpdate(
        testId,
        { $push: { questions: addQuestion._id } },
        { new: true }
      );

      return res
        .status(STATUS_CODES.CREATED)
        .json({ message: 'Question saved successfully', data: addQuestion });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to save question due to an internal server error'
        )
      );
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const questionId = req.params.id;
      const questionModel = ModelFactory.getModel(MODELS.Question);
      const question = await questionModel.findById(questionId).select('-__v').exec();
      if (!question) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          error: 'Question not found',
        });
      }
      return res.status(STATUS_CODES.OK).json({ data: question });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to fetch a question due to an internal server error'
        )
      );
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const questionModel = ModelFactory.getModel(MODELS.Question);
      const testModel = ModelFactory.getModel(MODELS.Test);

      const question = await questionModel.findOneAndDelete({
        _id: id,
      });

      if (!question) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          error: 'Question not found',
        });
      }

      const { testId } = question;
      await testModel.findByIdAndUpdate(
        testId,
        { $pull: { questions: question._id } },
        { new: true }
      );

      return res.status(STATUS_CODES.OK).json({ message: 'deleted successfully' });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to delete question due to internal server error',
          error
        )
      );
    }
  };

  updateMultipleChoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const questionModel = ModelFactory.getModel(MODELS.Question);
      const testModel = ModelFactory.getModel(MODELS.Test);

      const updatedQuestion = await questionModel
        .findByIdAndUpdate(id, { ...req.body }, { new: true })
        .exec();

      if (!updatedQuestion) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          error: 'Question not found',
        });
      }

      if (req.body.testId) {
        const { testId } = req.body;
        await testModel.findByIdAndUpdate(
          testId,
          { $pull: { questions: updatedQuestion._id } },
          { new: true }
        );
      }

      return res.status(STATUS_CODES.OK).json({ message: 'updated successfully' });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Unable to update question due to internal server error',
          error
        )
      );
    }
  };
}

export default new QuestionController();
