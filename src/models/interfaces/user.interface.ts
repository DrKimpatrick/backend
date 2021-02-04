import { Document } from 'mongoose';
import { PAYMENT_STATUS, SIGNUP_MODE, USER_ROLES } from '../../constants';

export default interface IUser extends Document {
  id: string;
  signupMode?: SIGNUP_MODE;
  firstName?: string;
  lastName?: string;
  contact?: string;
  email: string;
  username?: string;
  password: string;
  roles?: USER_ROLES[];
  verified?: boolean;
  featureChoice?: string;
  paymentStatus?: PAYMENT_STATUS;
  couponUsed?: string;
  skills?: string[];
  employmentHistory?: string[];
  educationHistory?: string[];
  stripeSubscriptionId?: string;
  // virtual properties
  name?: string;
  isSuperAdmin?: boolean;
  courses?: string[];
  profileProcess?: string;
  bio?: string;
  profilePicture?: string;
  paypalEmail?: string;
  linkToPlatform?: string;
  userCouponDetails?: any[];
  sharedLink?: string;
  recommendedBy?: string;
}

export interface IUserCoupon extends Document {
  coupon: string;
  issuer: string;
  createdAt?: string;
  modifiedAt?: string;
  usedBy?: string[];
}
