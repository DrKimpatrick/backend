import bcrypt from 'bcrypt';
import { HookNextFunction } from 'mongoose';
import { USER_ROLES } from '../constants';

export async function saveUser(next: HookNextFunction) {
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

export function isSuperAdmin() {
  // @ts-ignore
  return this.roles.includes(USER_ROLES.SUPER_ADMIN);
}

export function validatePassword(password: string) {
  // @ts-ignore
  return bcrypt.compare(password, this.password);
}

export function toAuthJSON() {
  // @ts-ignore
  const profile = this.toJSON();
  delete profile.password;
  delete profile.__v;
  return {
    profile,
    // @ts-ignore
    token: this.generateAccessToken(this.id, this.roles),
    // @ts-ignore
    refresh: this.generateRefreshToken(this.id, this.password),
  };
}
