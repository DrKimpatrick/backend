import { Router } from 'express';
import authController from './auth.controller';
import passport, { AuthenticateOptions } from 'passport';
import { environment } from '../../config/environment';
import cache from '../../shared/cache';

const authRouter = Router();

/**
 * @swagger
 * /api/v1/auth/login:
 *   get:
 *     summary: login
 *     tags: [Auth]
 *     description: login a user
 *     responses:
 *       200:
 *         description: logged in
 */
authRouter.get('/login', authController.login);

const routeSocialProvider = (strategy: string, options: AuthenticateOptions) => {
  authRouter.get(`/${strategy}`, cache.cacheRedirectUrl, passport.authenticate(strategy, options));
  authRouter.get(
    `/${strategy}/callback`,
    passport.authenticate(strategy, {
      failureRedirect: cache.get('SOCIAL_AUTH_REDIRECT_URL') || environment.socialAuthRedirectURL,
    }),
    authController.socialAuthCallback
  );
};

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Google auth
 *     tags: [SocialAuth]
 *     description: login a user using Google auth
 *     parameters:
 *       - name: redirect_url
 *         description: URL to redirect to after successful authentication. Takes data as a
 *           base64 encoded query param
 *         in: query
 *         required: true
 *     responses:
 *       302:
 *         description: redirect to Google prompt
 */
routeSocialProvider('google', { scope: ['profile', 'email'] });
/**
 * @swagger
 * /api/v1/auth/github:
 *   get:
 *     summary: Github auth
 *     tags: [SocialAuth]
 *     description: login a user using Github auth
 *     parameters:
 *       - name: redirect_url
 *         description: URL to redirect to after successful authentication. Takes data as a
 *           base64 encoded query param
 *         in: query
 *         required: true
 *     responses:
 *       302:
 *         description: redirect to Github prompt
 */
routeSocialProvider('github', {});
/**
 * @swagger
 * /api/v1/auth/linkedin:
 *   get:
 *     summary: Linkedin auth
 *     tags: [SocialAuth]
 *     description: login a user using Linkedin auth
 *     parameters:
 *       - name: redirect_url
 *         description: URL to redirect to after successful authentication. Takes data as a
 *           base64 encoded query param
 *         in: query
 *         required: true
 *     responses:
 *       302:
 *         description: redirect to Linkedin prompt
 */
routeSocialProvider('linkedin', {});

export { authRouter };
