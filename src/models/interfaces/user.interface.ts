import { Document } from 'mongoose';
import { SIGNUP_MODE, USER_ROLES } from '../../constants';

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
}
