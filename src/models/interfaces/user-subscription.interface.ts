import { Document } from 'mongoose';

export interface Payment {
  paidOn: Date;
  amount: number;
  featureChoice: string;
  subscriptionPriceId: string;
  interval: string;
  upTo?: number;
}
export interface IUserSubscription extends Document {
  userId: string;
  year: number;
  payment: Payment[];
  nextPaymentDate: Date;
}

export default IUserSubscription;
