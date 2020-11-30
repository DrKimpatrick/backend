import mongoose from 'mongoose';
import { SKILL_LEVEL, SKILL_VERIFICATION_STATUS } from '../constants';

const { Schema } = mongoose;

const userSkillSchema = new Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: false,
      default: null,
      unique: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: false,
    },
    level: {
      type: SKILL_LEVEL,
      default: SKILL_LEVEL.BEGINNER,
    },
    verificationStatus: {
      type: String,
      default: SKILL_VERIFICATION_STATUS.UNVERIFIED,
      enum: Object.values(SKILL_VERIFICATION_STATUS),
    },
  },
  { timestamps: true }
);

// unique together
userSkillSchema.index({ skill: 1, user: 1 }, { unique: true });

export = mongoose.model('UserSkill', userSkillSchema);
