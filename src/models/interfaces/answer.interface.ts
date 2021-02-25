import { Document } from 'mongoose';

export interface IAnswer extends Document {
  questionId: string;
  testId: string;
  answer: string[];
  grade: number;
  userId: string;
  dateRegistered: Date;
  updatedAt: Date;
}
