import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import { environment } from '../config/environment';
import { encrypt } from './index';

export async function saveUser(next: (...args: any) => void) {
  const SALT_WORK_FACTOR = 10;
  // @ts-ignore
  if (!this.isModified('password')) return next();
  // @ts-ignore
  if (!this.refreshToken) {
    // @ts-ignore
    const tkn = this.createRefreshToken();
    // @ts-ignore
    this.refreshToken = tkn.data;
    // @ts-ignore
    this.authTag = tkn.authTag;
  }
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    // @ts-ignore
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
}

export function getUserFullName() {
  // @ts-ignore
  return `${this.firstName} ${this.lastName}`;
}

export function validatePassword(password: string) {
  // @ts-ignore
  return bcrypt.compare(password, this.password);
}

export function getExpiry(minutes: number = 20): number {
  // Returns expiry in milliseconds
  const today = new Date();
  const expiry = new Date(today);

  expiry.setMinutes(today.getMinutes() + minutes); // 20 minutes
  return Number.parseInt((expiry.getTime() / 100).toString(), 10);
}

export function generateJWTToken() {
  return jsonwebtoken.sign(
    {
      // @ts-ignore
      id: this._id,
      // @ts-ignore
      exp: getExpiry(), // only for 20 minutes
    },
    environment.secretKey
  );
}

export function createRefreshToken(): { data: string; authTag: string } {
  return encrypt(
    JSON.stringify({
      // @ts-ignore
      email: this.email,
      expiry: getExpiry(60 * 24 * 7), // (60 * 24 * 7) for one week
    })
  );
}

export function toAuthJSON() {
  // @ts-ignore
  const profile = this.toJSON();
  if (profile.refreshToken !== undefined) {
    delete profile.refreshToken;
  }
  // @ts-ignore
  return { profile, token: this.generateJWTToken(), refresh: this.refreshToken };
}
