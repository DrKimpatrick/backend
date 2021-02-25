import { Document } from 'mongoose';

export interface ITest extends Document {
  name: string;
  description: string;
  timePolicy: string;
  questions?: string[];
  dateRegistered: Date;
  updatedAt: Date;
}
