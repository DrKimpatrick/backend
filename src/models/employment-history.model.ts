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
      type: String,
      default: SKILL_VERIFICATION_STATUS.UNVERIFIED,
      enum: [
        SKILL_VERIFICATION_STATUS.IN_PROGRESS,
        SKILL_VERIFICATION_STATUS.VERIFIED,
        SKILL_VERIFICATION_STATUS.UNVERIFIED,
      ],
      required: true,
    },
    isCurrentPosition: {
      type: Boolean,
      required: true,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

export = mongoose.model('EmploymentHistory', employmentHistorySchema);
