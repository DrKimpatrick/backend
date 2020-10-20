import mongoose from 'mongoose';
import { SKILL_LEVEL, SKILL_VERIFICATION_STATUS } from '../constants';

const { Schema } = mongoose;

const skillSchema = new Schema(
  {
    skill: {
      type: String,
      required: [true, 'Skill name is required'],
    },
    level: {
      type: SKILL_LEVEL,
      default: SKILL_LEVEL.BEGINNER,
    },
    verificationStatus: {
      type: SKILL_VERIFICATION_STATUS,
      default: SKILL_VERIFICATION_STATUS.UNVERIFIED,
    },
  },
  { timestamps: true }
);

export = mongoose.model('Skills', skillSchema);
