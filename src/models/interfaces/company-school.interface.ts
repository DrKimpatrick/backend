import { Document } from 'mongoose';

export interface ICompanyOrSchool extends Document {
  id: string;
  name: string;
  address: string;
  website: string;
  accountMangerName: string;
  email: string;
  phone: string;
  userId: string;
}
