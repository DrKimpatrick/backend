import util from 'util';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import * as google from 'passport-google-oauth';
import * as github from 'passport-github';
import * as linkedin from 'passport-linkedin-oauth2';
import { MODELS, SIGNUP_MODE, SOCIAL_AUTH_TYPES } from '../constants';
import { environment } from './environment';
import { ModelFactory } from '../models/model.factory';
import { logger } from '../shared/winston';
import { genRandomString } from '../helpers';

export const localStrategy = new LocalStrategy.Strategy(
  {
    usernameField: 'username',
    passwordField: 'password',
    session: false,
  },
  async (username: string, password: string, next: (...args: any) => void) => {
    const userM = ModelFactory.getModel(MODELS.USER);
    const error = { error: 'username or password is invalid' };
    try {
      const user = await userM
        .findOne({ $or: [{ username }, { email: username }] })
        .select('+password')
        .exec();
      if (!user) {
        return next(error, false);
      }

      if (!user.verified) {
        return next({ error: 'user account has not been verified' }, false);
      }

      const isValid = await user.validatePassword(password);

      if (isValid) {
        return next(null, user);
      }
      return next(error, false);
    } catch (err) {
      return next({ error: err.message || err }, false);
    }
  }
);

const findEmailFromProvider = (
  provider: SOCIAL_AUTH_TYPES,
  profile: google.Profile | github.Profile | linkedin.Profile
) => {
  try {
    if (profile && profile.emails && profile.emails.length > 0) {
      return profile.emails[0].value;
    }
  } catch (e) {
    logger.error(e);
  }
  return null;
};

const callback = (provider: SOCIAL_AUTH_TYPES) => async (
  accessToken: string,
  refreshToken: string,
  profile: google.Profile | github.Profile | linkedin.Profile,
  next: google.VerifyFunction
) => {
  try {
    const userEmail = findEmailFromProvider(provider, profile);

    const socialModal = ModelFactory.getModel(MODELS.SOCIAL_AUTH);
    let socialUser = await socialModal
      .findOneAndUpdate(
        { provider, socialId: profile.id },
        { profile, name: profile.displayName, email: userEmail },
        { upsert: true, new: true }
      )
      .exec();
    if (!socialUser) {
      return next('Unable to authenticate with Google', null, {
        message: 'Invalid login.',
      });
    }
    if (userEmail) {
      const userModal = ModelFactory.getModel(MODELS.USER);
      let user = await userModal.findOne({ email: userEmail }).exec();
      if (!user) {
        user = await userModal.create({
          signupMode: SIGNUP_MODE.SOCIAL,
          firstName: profile.displayName,
          email: userEmail,
          password: genRandomString(),
          username: userEmail,
          verified: true,
        });
      }
      socialUser = await socialModal
        .findByIdAndUpdate(socialUser.id, { user: user.id }, { new: true })
        .populate('user')
        .exec();
      if (socialUser.user) {
        socialUser = socialUser.user;
      }
    }
    return next(null, socialUser);
  } catch (err) {
    logger.error(err);
    return next(err.message || err, null, {
      message: 'Unable to Complete Registration',
    });
  }
};

export const googleStrategy = new google.OAuth2Strategy(
  {
    clientID: environment.googleClientId,
    clientSecret: environment.googleClientSecret,
    callbackURL: util.format(environment.socialAuthCallBackUrl, 'google'),
  },
  callback(SOCIAL_AUTH_TYPES.GOOGLE)
);

export const githubStrategy = new github.Strategy(
  {
    clientID: environment.githubClientId,
    clientSecret: environment.githubClientSecret,
    callbackURL: util.format(environment.socialAuthCallBackUrl, 'github'),
  },
  callback(SOCIAL_AUTH_TYPES.GITHUB)
);

export const linkedinStrategy = new linkedin.Strategy(
  {
    clientID: environment.linkedInClientId,
    clientSecret: environment.linkedInClientSecret,
    callbackURL: util.format(environment.socialAuthCallBackUrl, 'linkedin'),
    // @ts-ignore
    scope: ['r_liteprofile', 'r_emailaddress'],
  },
  callback(SOCIAL_AUTH_TYPES.LINKED_IN)
);

passport.use(googleStrategy);
passport.use(githubStrategy);
passport.use(linkedinStrategy);
passport.use(localStrategy);
