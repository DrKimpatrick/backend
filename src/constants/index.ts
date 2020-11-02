export enum SOCIAL_AUTH_TYPES {
  GOOGLE = 'GOOGLE',
  LINKED_IN = 'LINKED_IN',
  GITHUB = 'GITHUB',
}

export enum SIGNUP_MODE {
  SOCIAL = 'SOCIAL',
  LOCAL = 'LOCAL',
}

export enum SKILL_VERIFICATION_STATUS {
  UNVERIFIED = 'unverified',
  IN_PROGRESS = 'inProgress',
  VERIFIED = 'verified',
}

export enum SKILL_LEVEL {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum DOCUMENT_ACTION {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum PAYMENT_STATUS {
  UNPAID = 'unpaid',
  FAILED = 'failed',
  CONFIRMED = 'confirmed',
}

export enum FEATURE_CHOICE {
  PREMIUM = 'premium',
  BASIC = 'basic',
  STANDARD = 'standard',
}

export const MODELS = {
  USER: 'user',
  SOCIAL_AUTH: 'social-auth',
  SKILLS: 'skill',
  EDUCATION_HISTORY: 'education-history',
  EMPLOYMENT_HISTORY: 'employment-history',
  BETA_TESTER: 'beta-tester',
};

export const SENDER_EMAIL = 'support@techtalentqa.com';

export enum STATUS_CODES {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  FORBIDDEN = 403,
  BAD_REQUEST = 400,
  CONFLICT = 409,
  SERVER_ERROR = 500,
}

export enum USER_ROLES {
  TALENT = 'talent',
  EDUCATION = 'education',
  SUPER_ADMIN = 'super_admin',
  RECRUITMENT_ADMIN = 'recruitment_admin',
  HR_ADMIN = 'hr_admin',
  COMPANY_ADMIN = 'company_admin',
  TRAINNING_ADMIN = 'training_admin',
  TRAINING_AFFILIATE = 'training_affiliate',
}
