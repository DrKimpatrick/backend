import mongoose from 'mongoose';
import validator from 'validator';
import {
  createRefreshToken,
  generateJWTToken,
  getUserFullName,
  saveUser,
  toAuthJSON,
  validatePassword,
} from '../helpers/model.helpers';
import { SIGNUP_MODE } from '../constants';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    signupMode: {
      type: SIGNUP_MODE,
      default: SIGNUP_MODE.LOCAL,
    },
    firstName: {
      type: String,
      max: [20, 'First Name must not be this long. Should have at-most 20 characters'],
    },
    lastName: {
      type: String,
      max: [20, 'Last Name must not be this long. Should have at-most 20 characters'],
    },
    contact: {
      type: String,
      required: [false, "This user won't be activated without a phone number"],
      min: [10, 'A phone number can have at-least 10 digits'],
      max: [13, 'Please enter a valid phone number, this is too long'],
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
      required: [true, 'An Email is required'],
      validate: (input: string) => validator.isEmail(input),
    },
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, 'Username is required'],
    },
    password: {
      type: String,
      required: [true, 'A password is required'],
      select: false,
    },
    refreshToken: {
      type: String,
      required: false,
      select: false,
    },
    authTag: {
      type: String,
      required: false,
      select: false,
    },
    roles: {
      type: [String],
      default: 'talent',
      enum: [
        'talent',
        'super_admin',
        'recruitment_admin',
        'hr_admin',
        'company_admin',
        'training_admin',
        'training_affiliate',
      ],
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: 'dateRegistered' } }
);

userSchema.virtual('name').get(getUserFullName);

userSchema.pre('save', saveUser);

userSchema.methods.validatePassword = validatePassword;
userSchema.methods.generateJWTToken = generateJWTToken;
userSchema.methods.toAuthJSON = toAuthJSON;
userSchema.methods.createRefreshToken = createRefreshToken;

export = mongoose.model('User', userSchema);
