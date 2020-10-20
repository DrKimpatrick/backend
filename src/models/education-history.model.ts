import mongoose from 'mongoose';
import { SKILL_VERIFICATION_STATUS } from '../constants';

const { Schema } = mongoose;

const educationHistorySchema = new Schema(
  {
    schoolName: {
      type: String,
      required: [true, 'School name is required'],
    },
    level: {
      type: String,
    },
    degreeOrCertification: {
      type: String,
    },
    specializations: {
      type: [String],
    },
    startDate: {
      type: Date,
      required: [true, 'This field is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'This field is required'],
    },
    accomplishments: {
      type: [String],
    },
    verificationStatus: {
      type: SKILL_VERIFICATION_STATUS,
      default: SKILL_VERIFICATION_STATUS.UNVERIFIED,
    },
  },
  { timestamps: true }
);

export = mongoose.model('EducationHistory', educationHistorySchema);
