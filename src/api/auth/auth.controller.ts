import { Request, Response } from 'express';
import { environment } from '../../config/environment';
import * as url from 'url';
import cache from '../../shared/cache';
import { CREATED, SERVER_ERROR } from '../../constants/statusCodes';
import { MODELS } from '../../constants';
import { ModelFactory } from '../../models/model.factory';

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
  async register(req: Request, res: Response) {
    const { username, email, password } = req.body;
    try {
      const userModel = ModelFactory.getModel(MODELS.USER);
      const user = await userModel.create({
        username,
        email,
        password,
      });
      user.password = undefined;
      const data = user.toAuthJSON();

      // send email

      return res.status(CREATED).json({
        profile: user,
        token: data.token,
      });
    } catch (error) {
      return res.status(SERVER_ERROR).json({ error: error.message });
    }
  }
}

const authController = new AuthController();

export default authController;
