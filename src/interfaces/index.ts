import Stripe from 'stripe';
import { SKILL_LEVEL, SKILL_VERIFICATION_STATUS, USER_ROLES } from '../constants';

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

export interface IUserSkill {
  skill: string;
  level?: SKILL_LEVEL;
  verificationStatus?: SKILL_VERIFICATION_STATUS;
}

export interface Subsidy {
  planId: string;
  quantity: number;
  tier: Stripe.Plan.Tier;
}
