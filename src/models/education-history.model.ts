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
      required: [false, 'This field is required'],
    },
    isCurrentEducation: {
      type: Schema.Types.Boolean,
      default: true,
    },
    accomplishments: {
      type: [String],
    },
    verificationStatus: {
      type: String,
      default: SKILL_VERIFICATION_STATUS.UNVERIFIED,
      enum: Object.values(SKILL_VERIFICATION_STATUS),
    },
    schoolWebsite: {
      type: String,
      required: false,
    },
    certificateType: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export = mongoose.model('EducationHistory', educationHistorySchema);
