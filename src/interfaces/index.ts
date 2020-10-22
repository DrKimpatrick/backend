import { USER_ROLES } from '../constants';

export interface DecodeTokenType {
  header: { alg: string; typ: string };
  payload: { userId: string; exp: number; iat: number };
  signature: string;
}

export interface BaseTokenPayload {
  userId: string;
}

export interface AccessTokenPayload extends BaseTokenPayload {
  roles: [USER_ROLES];
}
