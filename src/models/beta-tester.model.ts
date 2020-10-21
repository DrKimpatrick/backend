import mongoose from 'mongoose';
import validator from 'validator';
import IBetaTester from './interfaces/beta-tester.interface';

const { Schema } = mongoose;

const betaTesterSchema = new Schema(
  {
    accountType: {
      type: String,
      required: true,
      enum: ['company', 'talent', 'school'],
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
      required: [true, 'An Email is required'],
      validate: (input: string) => validator.isEmail(input),
    },
  },
  { timestamps: true }
);

export = mongoose.model<IBetaTester>('BetaTester', betaTesterSchema);
