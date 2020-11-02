import mongoose from 'mongoose';
import { COURSE_VERIFICATION_STATUS } from '../constants';
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
    verificationStatus: {
      type: COURSE_VERIFICATION_STATUS,
      required: true,
      default: COURSE_VERIFICATION_STATUS.PENDING,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>('Course', courseSchema);
