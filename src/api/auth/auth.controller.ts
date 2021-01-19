import { NextFunction, Request, Response } from 'express';
import * as url from 'url';
import path from 'path';
import passport from 'passport';
import jsonwebtoken from 'jsonwebtoken';
import cache from '../../shared/cache';
import IUser from '../../models/interfaces/user.interface';
import { environment } from '../../config/environment';
import { MODELS, STATUS_CODES, USER_ROLES } from '../../constants';
import { ModelFactory } from '../../models/model.factory';
import { Email, sendEmail } from '../../config/sendgrid';
import { getEmailTemplate } from '../../shared/email.templates';
import { generateAccessToken, generateVerificationToken } from '../../helpers/auth.helpers';
import { logger } from '../../shared/winston';
import { BaseTokenPayload } from '../../interfaces';
import { generateJWTToken } from '../../helpers';
import { HttpError } from '../../helpers/error.helpers';

/**
 * @function authController
 * @description Handles all auth related business logic
 *
 */
export class AuthController {
  login(req: Request, res: Response, next: NextFunction) {
    // Need username/password in body
    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
      if (passportUser) {
        return res.json(passportUser.toAuthJSON());
      }

      return res.status(401).json(err || info);
    })(req, res, next);
  }

  socialAuthCallback(req: Request, res: Response) {
    let { user: socialUser }: any = req;
    if (socialUser && socialUser.user) {
      socialUser = socialUser.user;
    }
    // @ts-ignore
    const buff = Buffer.from(JSON.stringify(socialUser.toAuthJSON()));
    const data = buff.toString('base64');

    const endpoint = url.format({
      // pathname: cache.get('SOCIAL_AUTH_REDIRECT_URL') || environment.socialAuthRedirectURL,
      pathname: environment.socialAuthRedirectURL,
      query: { data },
    });

    logger.info(`Social Auth Redirecting user to: ${endpoint}`);

    cache.remove('SOCIAL_AUTH_REDIRECT_URL');
    res.redirect(endpoint);
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body;

      const userModel = ModelFactory.getModel<IUser>(MODELS.USER);

      const newUser = { username, email, password };

      const user = await userModel.create(newUser);

      const confirmationToken = generateVerificationToken(user.id);

      const pathToTemplate = path.join(__dirname, '../../', 'templates/account-confirmation.ejs');

      const ejsData = {
        username: user.username,
        token: confirmationToken,
        baseUrl: environment.baseUrl,
      };

      const confirmationEmail: Email = {
        html: await getEmailTemplate(pathToTemplate, ejsData),
        subject: 'Tech Talent Account Confirmation',
        to: user.email,
      };

      sendEmail(confirmationEmail);

      return res.status(STATUS_CODES.CREATED).json({
        message:
          'Registration complete. An activation link has been sent to your email. Click it to verify your account',
      });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Could not complete registration due to internal server error',
          error
        )
      );
    }
  }

  async verifyUserAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req?.currentUser?.id;
      if (req?.currentUser?.verified) {
        return res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: 'User account already verified' });
      }
      const userModel = ModelFactory.getModel<IUser>(MODELS.USER);
      await userModel.findByIdAndUpdate(userId, { verified: true });

      return res.status(STATUS_CODES.OK).json({
        message: `Account verification complete. Login at ${environment.baseUrl}/api/v1/auth/login to access your account`,
      });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Could not verify user account due to internal server error',
          error
        )
      );
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.headers.authorization?.split(' ')[1];

      if (!refreshToken) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Token is missing' });
      }

      const { userId } = jsonwebtoken.decode(refreshToken) as BaseTokenPayload;
      const userModel = ModelFactory.getModel<IUser>(MODELS.USER);
      const user = await userModel.findById(userId).select('+password');

      if (!user) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'User not found' });
      }

      // secret + user password hash combination allows us to bypass need of db
      const secret = environment.secretKey + user.password;
      jsonwebtoken.verify(refreshToken, secret);
      const newToken = generateAccessToken(user.id, user.roles);

      return res.status(STATUS_CODES.OK).json({ token: newToken });
    } catch (error) {
      return next(new HttpError(STATUS_CODES.UNAUTHORIZED, 'Invalid refresh token', error));
    }
  }

  async forgetPassword(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    try {
      const userModel = ModelFactory.getModel<IUser>(MODELS.USER);
      const user = await userModel.findOne({ email });

      if (!user) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Email not found' });
      }

      const resetPasswordToken = generateJWTToken({ userId: user._id }, 60 * 60 * 4); // (60 * 60 * 4) for 4 hours
      const ejsData = {
        username: user.username,
        token: resetPasswordToken,
        baseUrl: environment.baseUrl,
      };
      const pathToTemplate = path.join(__dirname, '../../', 'templates/password-reset.ejs');
      const resetPasswordEmail: Email = {
        html: await getEmailTemplate(pathToTemplate, ejsData),
        subject: 'Tech Talent Account Reset Password',
        to: user.email,
      };

      sendEmail(resetPasswordEmail);

      return res.status(STATUS_CODES.OK).json({
        message: 'Please check your email for password reset instructions',
      });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Could not send instructions to reset password due to an internal server error',
          error
        )
      );
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    const { password } = req.body;
    try {
      const userId = req?.currentUser?.id;
      const userModel = ModelFactory.getModel<IUser>(MODELS.USER);
      const user = await userModel.findById(userId);
      if (user) {
        user.password = password;
        await user.save();
      }
      return res.status(STATUS_CODES.OK).json({
        message: 'Password reset successful, you can now login',
      });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Could not reset your password due to an internal server',
          error
        )
      );
    }
  }

  async registerAffiliateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userModel = ModelFactory.getModel<IUser>(MODELS.USER);

      const newUser = {
        ...req.body,
        roles: [USER_ROLES.TRAINING_AFFILIATE],
      };

      const user = await userModel.create(newUser);

      const confirmationToken = generateVerificationToken(user.id);

      const pathToTemplate = path.join(__dirname, '../../', 'templates/account-confirmation.ejs');

      const ejsData = {
        username: user.username,
        token: confirmationToken,
        baseUrl: environment.baseUrl,
      };

      const confirmationEmail: Email = {
        html: await getEmailTemplate(pathToTemplate, ejsData),
        subject: 'Tech Talent Account Confirmation',
        to: user.email,
      };

      sendEmail(confirmationEmail);

      return res.status(STATUS_CODES.CREATED).json({
        message:
          'Registration complete. An activation link has been sent to your email. Click it to verify your account',
      });
    } catch (error) {
      return next(
        new HttpError(
          STATUS_CODES.SERVER_ERROR,
          'Could not complete registration due to internal server error',
          error
        )
      );
    }
  }
}

const authController = new AuthController();

export default authController;
