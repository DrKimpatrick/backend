import mongoose, { Schema } from 'mongoose';
import { IQuestion } from './interfaces/question.interface';
import { SKILL_LEVEL, QuestionType } from '../constants';

const questionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    library: {
      type: String,
      required: false,
    },
    question: {
      type: String,
      required: true,
    },
    solution: {
      type: [String],
      required: true,
    },
    level: {
      type: String,
      required: true,
      enum: Object.values(SKILL_LEVEL),
    },
    expectedTime: {
      type: String,
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Test',
    },
    questionType: {
      type: String,
      required: true,
      enum: Object.values(QuestionType),
    },
    choice: {
      type: [String],
      required: true,
    },
    coding: {
      template: {
        type: String,
        required: true,
      },
      testCase: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>('Question', questionSchema);
