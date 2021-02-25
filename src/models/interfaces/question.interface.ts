import { Document } from 'mongoose';

export interface ICoding {
  template: string;
  testCase: string;
}
export interface IQuestion extends Document {
  name: string;
  language: string;
  library?: string;
  question: string;
  solution: string[];
  level: string;
  expectedTime: string;
  testId: string;
  questionType: string;
  choice?: string[];
  coding?: ICoding;
  dateRegistered: Date;
  updatedAt: Date;
}
