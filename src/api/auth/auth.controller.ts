import { Request, Response } from 'express';
import { environment } from '../../config/environment';
import * as url from 'url';
import cache from '../../shared/cache';

/**
 * @function authController
 * @description Handles all auth related business logic
 *
 */
export class AuthController {
  login(req: Request, res: Response) {
    return res.status(200).json({ message: 'Logged in' });
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
}

const authController = new AuthController();

export default authController;
