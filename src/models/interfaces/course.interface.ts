import { Document } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  languageTaught: string;
  instructor: string;
  currentLangSpecsUpdated: boolean;
  existingCourseLink: string;
  coverImageLink: string;
  verificationStatus: string;
  level: string;
  description: string;
  duration: string;
  format: string;
  price: string;
  userId: string;
  billing: 'one-time' | 'day' | 'week' | 'month' | 'year';
  stripeInfo: {
    productId: String;
    priceId: String;
  };
}
