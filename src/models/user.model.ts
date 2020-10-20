import mongoose from 'mongoose';
import validator from 'validator';
import { getUserFullName, saveUser, toAuthJSON, validatePassword } from '../helpers/model.helpers';
import { FEATURE_CHOICE, PAYMENT_STATUS, SIGNUP_MODE } from '../constants';
import IUser from './interfaces/user.interface';
import { generateAccessToken, generateRefreshToken } from '../helpers/auth.helpers';

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
    },
    password: {
      type: String,
      required: [true, 'A password is required'],
      select: false,
    },
    roles: {
      type: [String],
      enum: [
        'talent',
        'education',
        'super_admin',
        'recruitment_admin',
        'hr_admin',
        'company_admin',
        'training_admin',
        'training_affiliate',
      ],
      required: [true, 'A valid user role is required'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    featureChoice: {
      type: FEATURE_CHOICE,
      default: FEATURE_CHOICE.FREE,
    },
    paymentStatus: {
      type: PAYMENT_STATUS,
      default: PAYMENT_STATUS.UNPAID,
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skills',
        required: false,
        default: null,
      },
    ],
    employmentHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentHistory',
        required: false,
        default: null,
      },
    ],
    educationHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EducationHistory',
        required: false,
        default: null,
      },
    ],
  },
  { timestamps: { createdAt: 'dateRegistered' } }
);

userSchema.virtual('name').get(getUserFullName);

userSchema.pre('save', saveUser);

userSchema.methods.validatePassword = validatePassword;
userSchema.methods.generateAccessToken = generateAccessToken;
userSchema.methods.toAuthJSON = toAuthJSON;
userSchema.methods.generateRefreshToken = generateRefreshToken;

export = mongoose.model<IUser>('User', userSchema);
