import mongoose from 'mongoose';
import { SKILL_VERIFICATION_STATUS } from '../constants';

const { Schema } = mongoose;

const employmentHistorySchema = new Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company is required'],
    },
    supervisor: {
      type: String,
    },
    title: {
      type: String,
      required: [true, 'Title held while at company is is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'This field is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'This field is required'],
    },
    skillsUsed: {
      type: [String],
    },
    responsibilities: {
      type: [String],
    },
    accomplishments: {
      type: [String],
    },
    favoriteProject: {
      type: String,
    },
    verificationStatus: {
      type: SKILL_VERIFICATION_STATUS,
      default: SKILL_VERIFICATION_STATUS.UNVERIFIED,
    },
  },
  { timestamps: true }
);

export = mongoose.model('EmploymentHistory', employmentHistorySchema);
