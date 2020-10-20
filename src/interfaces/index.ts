import { USER_ROLES } from '../constants';

export interface BaseTokenPayload {
  userId: string;
}

export interface AccessTokenPayload extends BaseTokenPayload {
  roles: [USER_ROLES];
}
