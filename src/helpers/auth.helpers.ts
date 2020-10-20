import jsonwebtoken from 'jsonwebtoken';
import { environment } from '../config/environment';
import { USER_ROLES } from '../constants';

export const generateVerificationToken = (userId: string) => {
  return jsonwebtoken.sign(
    {
      userId,
    },
    environment.secretKey
  );
};

export const generateAccessToken = (userId: string, roles: USER_ROLES[], expiry = '20m') => {
  return jsonwebtoken.sign(
    {
      roles,
      userId,
    },
    environment.secretKey,
    { expiresIn: expiry }
  );
};

export const generateRefreshToken = (userId: string, passwordHash: string, expiry = '7d') => {
  const secret = environment.secretKey + passwordHash;
  return jsonwebtoken.sign(
    {
      userId,
    },
    secret,
    { expiresIn: expiry }
  );
};
