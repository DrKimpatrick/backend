import jsonwebtoken from 'jsonwebtoken';
import express_jwt from 'express-jwt';
import { Request } from 'express';
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

export const generateAccessToken = (userId: string, roles?: USER_ROLES[], expiry = '20m') => {
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

const getTokenFromHeaders = (req: Request) => {
  const {
    headers: { authorization },
  } = req;
  if (authorization && authorization.split(' ')[0].toLowerCase() === 'bearer') {
    return authorization.split(' ')[1];
  }
  return null;
};

export const auth = {
  required: express_jwt({
    secret: environment.secretKey,
    userProperty: 'payload',
    algorithms: ['HS256'],
    getToken: getTokenFromHeaders,
  }),
  optional: express_jwt({
    secret: environment.secretKey,
    userProperty: 'payload',
    algorithms: ['HS256'],
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
  }),
};
