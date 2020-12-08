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
      name: {
        type: String,
        required: true,
      },
      detail: {
        name: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        email: { type: String, required: true },
      },
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
    skillsUsed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'UserSkill',
        default: null,
      },
    ],
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
      ref: 'User',
    },
  },
  { timestamps: true }
);

export = mongoose.model('EmploymentHistory', employmentHistorySchema);
