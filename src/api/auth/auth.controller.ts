import { NextFunction, Request, Response } from 'express';
import * as url from 'url';
import { environment } from '../../config/environment';
import cache from '../../shared/cache';
import passport from 'passport';
import { MODELS, STATUS_CODES } from '../../constants';
import { ModelFactory } from '../../models/model.factory';
import { Email, sendEmail } from '../../config/mailchimp';
import { getWelcomeEmail } from '../../shared/email.templates';
import IUser from '../../models/interfaces/user.interface';
import { generateVerificationToken } from '../../helpers/auth.helpers';
import { logger } from '../../shared/winston';

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
      pathname: cache.get('SOCIAL_AUTH_REDIRECT_URL') || environment.socialAuthRedirectURL,
      query: { data },
    });
    cache.remove('SOCIAL_AUTH_REDIRECT_URL');
    res.redirect(endpoint);
  }

  async register(req: Request, res: Response) {
    const { username, email, password } = req.body;
    try {
      const userModel = ModelFactory.getModel<IUser>(MODELS.USER);
      const user = await userModel.create({
        username,
        email,
        password,
      });
      const confirmationToken = generateVerificationToken(user.id);
      const confirmationEmail: Email = {
        html: await getWelcomeEmail(`${user.email}`, confirmationToken),
        subject: 'Tech Talent Account Confirmation',
        to: [{ email: user.email, type: 'to' }],
      };

      sendEmail(confirmationEmail);

      return res.status(STATUS_CODES.CREATED).json({
        message:
          'Registration complete. An activation link has been sent to your email. Click it to verify your account',
      });
    } catch (error) {
      logger.error(error);
      return res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ error: 'Could not complete registration due to internal server error' });
    }
  }

  async verifyUserAccount(req: Request, res: Response) {
    try {
      const userId = req?.currentUser?.id;
      const userModel = ModelFactory.getModel<IUser>(MODELS.USER);
      await userModel.findByIdAndUpdate(userId, { verified: true });

      return res.status(STATUS_CODES.OK).json({
        message: `Account verification complete. Login at ${environment.baseUrl}/api/v1/auth/login to access your account`,
      });
    } catch (error) {
      logger.error(error);
      return res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ error: 'Could not verify user account due to internal server error' });
    }
  }
}

const authController = new AuthController();

export default authController;
