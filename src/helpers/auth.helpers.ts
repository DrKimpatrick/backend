import jsonwebtoken from 'jsonwebtoken';
import { Request } from 'express';
import { environment } from '../config/environment';
import { USER_ROLES } from '../constants';
import { DecodeTokenType } from '../interfaces';

export const generateVerificationToken = (userId: string) =>
  jsonwebtoken.sign(
    {
      userId,
    },
    environment.secretKey
  );

export const generateAccessToken = (userId: string, roles?: USER_ROLES[], expiry = '20m') =>
  jsonwebtoken.sign(
    {
      roles,
      userId,
    },
    environment.secretKey,
    { expiresIn: expiry }
  );

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

export const decodeJWT = (token: string): DecodeTokenType | null =>
  jsonwebtoken.verify(token, environment.secretKey, { complete: true }) as DecodeTokenType;

export const getTokenFromRequest = (req: Request, inBody = false) => {
  let {
    headers: { authorization },
  } = req;

  if (inBody) {
    authorization = req.body.token as string;
  }

  if (inBody && authorization) {
    return authorization;
  }

  if (authorization && authorization.split(' ')[0].toLowerCase() === 'bearer') {
    return authorization.split(' ')[1];
  }
  return null;
};
