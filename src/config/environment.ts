import dotenv from 'dotenv';

dotenv.config();

const environments = {
  test: {
    dbUrl: process.env.TEST_DB_URI,
  },
  development: {
    dbUrl: process.env.DB_URI,
  },
  production: {
    dbUrl: '',
  },
};

const getEnv = () => {
  if (process.env.NODE_ENV === 'development') {
    return environments.development;
  }

  if (process.env.NODE_ENV === 'test') {
    return environments.test;
  }

  return environments.production;
};

const environment = getEnv();

// Export the module
export { environment };
