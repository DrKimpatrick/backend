import dotenv from 'dotenv';

dotenv.config();

const environment = {
  env: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DB_URI,
  secretKey: process.env.SECRET_KEY || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  githubClientId: process.env.CLIENT_ID_GITHUB || '',
  githubClientSecret: process.env.CLIENT_SECRET_GITHUB || '',
  linkedInClientId: process.env.LINKEDIN_CLIENT_ID || '',
  linkedInClientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  socialAuthCallBackUrl: process.env.SOCIAL_AUTH_CALLBACK_URL || '',
  socialAuthRedirectURL:
    process.env.SOCIAL_AUTH_REDIRECT_URL || 'http://localhost:3000/dashboard/auth/verify/',
  mailchimpApiKey: process.env.MAILCHIMP_API_KEY || '',
  baseUrl: process.env.BASE_URL || '',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
};

if (environment.env === 'test') {
  environment.dbUrl = process.env.TEST_DB_URI || '';
}

export { environment };
