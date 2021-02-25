import mongoose, { Schema } from 'mongoose';
import { ITest } from './interfaces/test.interface';

const testSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    timePolicy: {
      type: String,
      required: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Question',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ITest>('Test', testSchema);
