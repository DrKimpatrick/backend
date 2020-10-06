import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import { environment } from '../config/environment';

export async function saveUser(next: (...args: any) => void) {
  const SALT_WORK_FACTOR = 10;
  // @ts-ignore
  if (!this.isModified('password')) return next();
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

export function generateJWTToken() {
  const today = new Date();
  const expiry = new Date(today);

  expiry.setDate(today.getDate() + 2);
  return jsonwebtoken.sign(
    {
      // @ts-ignore
      id: this._id,
      // @ts-ignore
      exp: Number.parseInt(expiry.getTime() / 100, 10),
    },
    environment.secretKey
  );
}

export function toAuthJSON() {
  // @ts-ignore
  return { profile: this.toJSON(), token: this.generateJWTToken() };
}
