import { Document } from 'mongoose';
import { FEATURE_CHOICE, PAYMENT_STATUS, SIGNUP_MODE, USER_ROLES } from '../../constants';

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
  featureChoice?: FEATURE_CHOICE;
  paymentStatus?: PAYMENT_STATUS;
  skills?: string[];
  employmentHistory?: string[];
  educationHistory?: string[];
  // virtual properties
  name?: string;
  isSuperAdmin?: boolean;
  courses?: string[];
}
