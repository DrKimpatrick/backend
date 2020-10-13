import { Router } from 'express';
import authController from './auth.controller';
import passport, { AuthenticateOptions } from 'passport';
import { environment } from '../../config/environment';
import cache from '../../shared/cache';
import { validate, registrationValidator } from '../../helpers/request-validation.helpers';
import { checkAccountVerificationToken } from '../../middleware/auth.middleware';

const authRouter = Router();

/**
 * @swagger
 * definition:
 *   RegistrationError:
 *     type: object
 *     properties:
 *       errors:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             value:
 *               type: string
 *             msg:
 *               type: string
 *             param:
 *               type: string
 *             location:
 *               type: string
 *   RegisterResponse:
 *     type: object
 *     properties:
 *       profile:
 *         $ref: '#/definitions/User'
 *       token:
 *         type: string
 *   Error:
 *     type: object
 *     properties:
 *       error:
 *         type: string
 *         description: Error message
 *   UserLogin:
 *     type: object
 *     required:
 *       - username
 *       - password
 *     properties:
 *       username:
 *         type: string
 *       password:
 *         type: string
 *         format: password
 *   LoginResponse:
 *     type: object
 *     properties:
 *       refresh:
 *         type: string
 *       token:
 *         type: string
 *       profile:
 *         $ref: '#/definitions/User'
 *   User:
 *     type: object
 *     properties:
 *       id:
 *           type: integer
 *           format: int64
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     description: login a user
 *     parameters:
 *       - name: username
 *         description: Username or email
 *         in: body
 *         required: true
 *         type: string
 *       - name: password
 *         description: user password
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/LoginResponse'
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
authRouter.post('/login', authController.login);

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

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register
 *     tags: [Auth]
 *     description: Register a user
 *     parameters:
 *       - name: email
 *         description: user email
 *         in: body
 *         required: true
 *         type: string
 *       - name: username
 *         description: Username
 *         in: body
 *         required: true
 *         type: string
 *       - name: password
 *         description: user password
 *         in: body
 *         required: true
 *         type: string
 *         format: password
 *     responses:
 *       201:
 *         description: Registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/RegisterResponse'
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/RegistrationError'
 */
authRouter.post('/register', validate(registrationValidator()), authController.register);

/**
 * @swagger
 * /api/v1/auth/verify-account:
 *   get:
 *     summary: Verify account
 *     tags: [Auth]
 *     description: Verify user account
 *     parameters:
 *       - name: token
 *         description: account verification token
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Account verified
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 *       500:
 *          description: Internal Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
authRouter.get('/verify-account', checkAccountVerificationToken, authController.verifyUserAccount);

export { authRouter };
