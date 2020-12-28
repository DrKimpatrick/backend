import mongoose from 'mongoose';
import { SKILL_VERIFICATION_STATUS, EmploymentType } from '../constants';

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
        required: false,
      },
      detail: {
        name: { type: String },
        phoneNumber: { type: String },
        email: { type: String },
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
      enum: Object.values(SKILL_VERIFICATION_STATUS),
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
    reference: {
      name: {
        type: String,
        required: false,
      },
      detail: {
        name: { type: String },
        phoneNumber: { type: String },
        email: { type: String },
      },
    },
    employmentType: {
      type: String,
      required: true,
      enum: Object.values(EmploymentType),
    },
  },
  { timestamps: true }
);

export = mongoose.model('EmploymentHistory', employmentHistorySchema);
