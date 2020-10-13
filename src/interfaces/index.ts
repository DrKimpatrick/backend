import { USER_ROLES } from '../constants';

export interface AccountVerificationTokenPayload {
  id: string;
}

export interface AccessTokenPayload {
  id: string;
  roles: [USER_ROLES];
}
