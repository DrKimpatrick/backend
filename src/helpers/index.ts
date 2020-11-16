import * as crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import { environment } from '../config/environment';

export const genRandomString = () => crypto.randomBytes(20).toString('hex');

export const encrypt = (unencrypted: string): { authTag: string; data: string } => {
  const hash = crypto.createHash('sha256').update('TECH_TALENT').digest();
  const cipheriv = crypto.createCipheriv('aes-256-gcm', hash, environment.secretKey);
  let encrypted = cipheriv.update(unencrypted, 'utf8', 'base64');
  encrypted += cipheriv.final('base64');
  const authTag = JSON.stringify(cipheriv.getAuthTag().toJSON());
  return { authTag, data: encrypted };
};

export const decrypt = (encrypted: string, authTag: string): string => {
  const hash = crypto.createHash('sha256').update('TECH_TALENT').digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', hash, environment.secretKey);
  const authTag1 = JSON.parse(authTag);
  decipher.setAuthTag(Buffer.from(authTag1, 'utf8'));
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * @function generateJWTToken
 * @description function to generate a jwt token
 * @param {object} data - data to passe in a token, e.g {id: user.id}
 * @param {number} expiresIn - expiration time in seconds
 */
export const generateJWTToken = (data: object, expiresIn = 3600) =>
  jsonwebtoken.sign(
    {
      ...data,
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    },
    environment.secretKey
  );
