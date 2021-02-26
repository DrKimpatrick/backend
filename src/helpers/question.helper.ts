import { body } from 'express-validator';
import validator from 'validator';
import mongoose from 'mongoose';
import { QuestionType, SKILL_LEVEL, LANGUAGE, MODELS } from '../constants';
import { validateArrayOfStrings } from './user-profile-validation.helper';
import { ModelFactory } from '../models/model.factory';

export class QuestionHelper {
  createMultipleChoiceRule = () => {
    return [
      body('name', 'name is required').notEmpty(),
      body('name').isLength({ min: 3 }).withMessage('name must be more than 3 characters'),
      body('language', 'language is required').notEmpty(),
      body('language').custom((val) => {
        const language = Object.values(LANGUAGE);

        if (!val) {
          return Promise.reject(`language must be one from list (${language})`);
        }

        if (val && !language.includes(val)) {
          return Promise.reject(`language must be one from list (${language})`);
        }

        return true;
      }),
      body('question', 'question is required').notEmpty({ ignore_whitespace: true }),
      body('question').isLength({ min: 3 }).withMessage('question must be more than 3 characters'),
      body('question').custom((val, { req }) => {
        if (req.body.questionType === QuestionType.Video) {
          if (!validator.isURL(val)) {
            return Promise.reject('question must be valid url');
          }
        }
        return true;
      }),
      body('choice')
        .custom(validateArrayOfStrings)
        .withMessage('solution should be an array of strings'),
      body('solution')
        .custom(validateArrayOfStrings)
        .withMessage('solution should be an array of strings'),
      body('expectedTime', 'expectedTime is required').notEmpty({ ignore_whitespace: true }),
      body('level').notEmpty().withMessage('level is required'),
      body('level').custom((val) => {
        const level = Object.values(SKILL_LEVEL);

        if (!val) {
          return Promise.reject(`level must be one from list (${level})`);
        }

        if (val && !level.includes(val)) {
          return Promise.reject(`level must be one from list (${level})`);
        }

        return true;
      }),
      body('questionType').notEmpty().withMessage('questionType is required'),
      body('questionType').custom((val) => {
        const question = Object.values(QuestionType);

        if (!val) {
          return Promise.reject(`Question type must be one from list (${question})`);
        }

        if (val && !question.includes(val)) {
          return Promise.reject(`Question type must be one from list (${question})`);
        }

        return true;
      }),
      body('testId', 'testId is required').notEmpty({ ignore_whitespace: true }),
      body('testId').custom(async (val) => {
        const testModel = ModelFactory.getModel(MODELS.Test);

        if (!mongoose.Types.ObjectId.isValid(val)) {
          return Promise.reject('Invalid testId');
        }

        const test = await testModel.findOne({ _id: val });

        if (!test) {
          return Promise.reject('Test does not exist');
        }
        return true;
      }),
    ];
  };

  updateMultipleChoiceRule = () => {
    return [
      body('name')
        .isLength({ min: 3 })
        .withMessage('name must be more than 3 characters')
        .optional(),
      body('language')
        .custom((val) => {
          const language = Object.values(LANGUAGE);

          if (!val) {
            return Promise.reject(`language must be one from list (${language})`);
          }

          if (val && !language.includes(val)) {
            return Promise.reject(`language must be one from list (${language})`);
          }

          return true;
        })
        .optional(),
      body('question')
        .isLength({ min: 3 })
        .withMessage('question must be more than 3 characters')
        .optional(),
      body('question')
        .custom((val, { req }) => {
          if (req.body.questionType === QuestionType.Video) {
            if (!validator.isURL(val)) {
              return Promise.reject('question must be valid url');
            }
          }
          return true;
        })
        .optional(),
      body('choice')
        .custom(validateArrayOfStrings)
        .withMessage('solution should be an array of strings')
        .optional(),
      body('solution')
        .custom(validateArrayOfStrings)
        .withMessage('solution should be an array of strings')
        .optional(),
      body('level')
        .custom((val) => {
          const level = Object.values(SKILL_LEVEL);

          if (!val) {
            return Promise.reject(`level must be one from list (${level})`);
          }

          if (val && !level.includes(val)) {
            return Promise.reject(`level must be one from list (${level})`);
          }

          return true;
        })
        .optional(),
      body('questionType')
        .custom((val) => {
          const question = Object.values(QuestionType);

          if (!val) {
            return Promise.reject(`Question type must be one from list (${question})`);
          }

          if (val && !question.includes(val)) {
            return Promise.reject(`Question type must be one from list (${question})`);
          }

          return true;
        })
        .optional(),
      body('testId')
        .custom(async (val) => {
          const testModel = ModelFactory.getModel(MODELS.Test);

          if (!mongoose.Types.ObjectId.isValid(val)) {
            return Promise.reject('Invalid testId');
          }

          const test = await testModel.findOne({ _id: val });

          if (!test) {
            return Promise.reject('Test does not exist');
          }
          return true;
        })
        .optional(),
    ];
  };
}

export default new QuestionHelper();
