import mongoose from 'mongoose';
import validator from 'validator';
import { ICompanyOrSchool as ISchool } from './interfaces/company-school.interface';

const { Schema } = mongoose;

export const schoolSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    website: {
      type: String,
      required: [true, 'Website is required'],
    },
    accountManagerName: {
      type: String,
      required: [true, 'Account manager name or title is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      validate: (input: string) => validator.isEmail(input),
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISchool>('School', schoolSchema);
