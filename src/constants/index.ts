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
  USER_SKILLS: 'user-skill',
  SOCIAL_AUTH: 'social-auth',
  SKILL: 'skill',
  EDUCATION_HISTORY: 'education-history',
  EMPLOYMENT_HISTORY: 'employment-history',
  BETA_TESTER: 'beta-tester',
  COURSE: 'course',
  COMPANY: 'company',
  SCHOOL: 'school',
  USER_COUPON: 'user-coupon',
  USER_SUBSCRIPTION: 'user-subscription',
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

export enum COURSE_VERIFICATION_STATUS {
  ACCEPTED = 'accepted',
  PENDING = 'pending',
  DECLINED = 'declined',
}

export enum TalentProcess {
  CurrentRole = 'currentRole',
  SkillRanking = 'skillRanking',
  RecentEmployer = 'recentEmployer',
  AddEducation = 'addEducation',
  Completed = 'completed',
  SingleEducation = 'singleEducation',
  ListEducation = 'listEducation',
  SingleEmployment = 'singleEmployment',
  ListEmployment = 'listEmployment',
}

export enum Supervisor {
  Staffing = 'Staffing',
  Employee = 'Employee',
  Hr = 'HR',
}

export enum AdminsProcess {
  AddCompany = 'AddCompany',
  AddSchool = 'AddSchool',
  AddPlan = 'AddPlan',
  Payment = 'Payment',
  Completed = 'Completed',
}

export enum AffiliateProcess {
  AddMoreInfo = 'AddMoreInfo',
  Completed = 'Completed',
}

export const PRODUCTS = {
  talent: '',
};

export const PRODUCT_PLANS = [
  {
    name: 'Talent Basic',
    features: [{ available: true, name: 'Unverified Resume Listing' }],
  },
  {
    name: 'Talent Standard',
    features: [
      {
        available: false,
        name: 'Top Talent Listing',
        detail:
          'Employment verification- standard. International Employment Verification - charge a fee.',
      },
      {
        available: true,
        name: 'Employment Verification',
        detail:
          'Domestic Education verification- standard. International Education Verification - charge a fee.',
      },
      {
        available: true,
        name: 'Education Verification',
        detail: 'Your education records will be pre verified expediting the hiring process.',
      },
      {
        available: false,
        name: '3 Skill Certification Vouchers',
        detail: '3 each at 11% Vouchers for any tech talent skill certification test.',
      },
      {
        available: true,
        name: '15% off Certification & Training',
        detail: '15% off all tech talent certifications & training.',
      },
    ],
  },
  {
    name: 'Talent Premium',
    features: [
      {
        available: true,
        name: 'Top Talent Listing',
        detail: 'Employers will see your profile  before standard & basic members.',
      },
      {
        available: true,
        name: 'Employment Verification',
        detail: 'Your employment records will be pre verified expediting the hiring process.',
      },
      {
        available: true,
        name: 'Education Verification',
        detail: 'Your education records will be pre verified expediting the hiring process.',
      },
      {
        available: true,
        name: '3 Skill Certification Vouchers',
        detail: '3 Vouchers for any tech talent skill certification test.',
      },
      {
        available: true,
        name: '15% off Certification & Training',
        detail: '15% off all tech talent certifications & training.',
      },
    ],
  },
];

export enum EmploymentType {
  Contract = 'Contract',
  FullTime = 'FullTime',
  PartTime = 'PartTime',
}

export enum EmploymentReference {
  CoWorker = 'Coworker',
  SuperVisor = 'Supervisor',
  HR = 'HR',
}

export enum SUBSIDY_INTERVAL {
  MONTH = 'month',
  YEAR = 'year',
}

export enum CourseTimeFormat {
  Minute = 'Min',
  Hour = 'Hr',
}

export enum COURSE_BILLING_OPTIONS {
  ONE_TIME = 'one-time',
  DAILY = 'day',
  WEEKLY = 'week',
  MONTHLY = 'month',
  YEARLY = 'year',
}

export const AFFILIATE_PRODUCT_PREFIX = 'affiliate_';
