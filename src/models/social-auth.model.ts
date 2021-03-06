import mongoose from 'mongoose';
import { SOCIAL_AUTH_TYPES } from '../constants';
import { generateAccessToken } from '../helpers/auth.helpers';
import { toAuthJSON } from '../helpers/model.helpers';

const socialAuthSchema = new mongoose.Schema(
  {
    provider: {
      type: SOCIAL_AUTH_TYPES,
      required: true,
    },
    socialId: {
      type: String,
      required: true,
    },
    name: {
      type: mongoose.Schema.Types.String,
    },
    profile: {
      type: mongoose.Schema.Types.Mixed,
    },
    dateRegistered: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

socialAuthSchema.methods.generateJWTToken = generateAccessToken;
socialAuthSchema.methods.toAuthJSON = toAuthJSON;

export = mongoose.model('SocialAuth', socialAuthSchema);
