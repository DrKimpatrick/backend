import mongoose, { Schema } from 'mongoose';
import { IAnswer } from './interfaces/answer.interface';

const answerSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Question',
    },
    testId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Test',
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    answer: {
      type: [String],
      required: true,
    },
    grade: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAnswer>('Answer', answerSchema);
