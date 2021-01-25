import mongoose from 'mongoose';
import { COURSE_VERIFICATION_STATUS, SKILL_LEVEL } from '../constants';
import { ICourse } from './interfaces/course.interface';

const { Schema } = mongoose;

export const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    languageTaught: {
      type: String,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
    currentLangSpecsUpdated: {
      type: Boolean,
      required: true,
      default: false,
    },
    existingCourseLink: {
      type: String,
      required: true,
    },
    coverImageLink: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verificationStatus: {
      type: String,
      required: true,
      enum: [
        COURSE_VERIFICATION_STATUS.PENDING,
        COURSE_VERIFICATION_STATUS.ACCEPTED,
        COURSE_VERIFICATION_STATUS.DECLINED,
      ],
      default: COURSE_VERIFICATION_STATUS.PENDING,
    },
    level: {
      type: String,
      required: true,
      enum: Object.values(SKILL_LEVEL),
    },
    description: {
      type: String,
      required: false,
      default: null,
    },
    duration: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>('Course', courseSchema);
