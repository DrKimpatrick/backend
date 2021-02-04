import jsonwebtoken from 'jsonwebtoken';
import { Request } from 'express';
import crypto from 'crypto';
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

export const encryptText = (value: string): string => {
  const { cryptoAlgorithm, secretKey } = environment;

  // Initialization vector
  const iv = Buffer.alloc(16, 0);

  // generate key length
  const key = crypto.scryptSync(secretKey, 'salt', 24);

  const cipher = crypto.createCipheriv(cryptoAlgorithm, key, iv);

  let encrypted = cipher.update(value, 'utf8', 'hex');

  encrypted += cipher.final('hex');

  return encrypted;
};

export const decryptText = (value: string) => {
  const { cryptoAlgorithm, secretKey } = environment;

  // Initialization vector
  const iv = Buffer.alloc(16, 0);

  // generate key length
  const key = crypto.scryptSync(secretKey, 'salt', 24);

  const decipher = crypto.createDecipheriv(cryptoAlgorithm, key, iv);

  let decrypted = decipher.update(value, 'hex', 'utf8');

  decrypted += decipher.final('utf8');

  return decrypted;
};
