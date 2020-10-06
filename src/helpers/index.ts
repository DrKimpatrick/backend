import * as crypto from 'crypto';

export const genRandomString = () => {
  return crypto.randomBytes(20).toString('hex');
};
