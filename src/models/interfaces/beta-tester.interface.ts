import { Document } from 'mongoose';

export default interface IBetaTester extends Document {
  id: string;
  accountType: string;
  name: string;
  email: string;
}
