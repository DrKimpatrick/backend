import mongoose from 'mongoose';
import validator from 'validator';
import { generateJWTToken, saveUser, toAuthJSON, validatePassword } from '../helpers/model.helpers';
import { SIGNUP_MODE } from '../constants';

const { Schema } = mongoose;

const userSchema = new Schema({
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
  fullName: {
    type: String,
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
    required: [true, 'An Email is required'],
    validate: (input: string) => validator.isEmail(input),
  },
  password: {
    type: String,
    required: [true, 'A password is required'],
    select: false,
  },
  dateRegistered: {
    type: Date,
    default: Date.now,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre('save', saveUser);

userSchema.methods.validatePassword = validatePassword;
userSchema.methods.generateJWTToken = generateJWTToken;
userSchema.methods.toAuthJSON = toAuthJSON;

export = mongoose.model('User', userSchema);
