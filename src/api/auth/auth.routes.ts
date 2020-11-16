import { Router } from 'express';
import passport, { AuthenticateOptions } from 'passport';
import authController from './auth.controller';
import { environment } from '../../config/environment';
import cache from '../../shared/cache';
import {
  validate,
  registrationRules,
  passwordValidator,
  confirmPasswordValidator,
} from '../../helpers/request-validation.helpers';
import { requireToken } from '../../middleware/auth.middleware';

const authRouter = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
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
 *   RefreshSuccessResponse:
 *     type: object
 *     properties:
 *       token:
 *         type: string
 *   RefreshFailureResponse:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *   ResponseResetPassword:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *         description: Successful message
 *   Error404:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *         description: Error message
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
authRouter.post('/register', validate(registrationRules()), authController.register);

/**
 * @swagger
 * /api/v1/auth/verify-account:
 *   post:
 *     summary: Verify account
 *     tags: [Auth]
 *     description: Verify user account
 *     parameters:
 *       - name: token
 *         description: account verification token
 *         in: body
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
authRouter.post('/verify-account', requireToken(true), authController.verifyUserAccount);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   get:
 *     summary: Get a new access token
 *     tags: [Auth]
 *     description: Returns a new access token by providing a valid refresh token
 *     parameters:
 *       - name: Authorization
 *         description: Bearer token
 *         in: headers
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/RefreshSuccessResponse'
 *       401:
 *         description: Failed
 *         content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/RefreshFailureResponse'
 */
authRouter.get('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/v1/auth/forget-password:
 *   post:
 *     summary: Forget password
 *     tags: [Auth]
 *     description: User requests for password reset once he/she has forgotten it
 *     parameters:
 *       - name: email
 *         description: user email
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful sent a link to reset password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ResponseResetPassword'
 *       404:
 *          description: Email Not Found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error404'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#definitions/Error'
 */
authRouter.post('/forget-password', authController.forgetPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: reset password
 *     tags: [Auth]
 *     description: User requests for password reset
 *     parameters:
 *       - name: token
 *         description: token sent to the user email account
 *         in: body
 *         required: true
 *         type: string
 *       - name: password
 *         description: new password
 *         in: body
 *         required: true
 *         type: string
 *       - name: confirm-password
 *         description: confirm password
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful reset passed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ResponseResetPassword'
 *       401:
 *          description: Invalid or expired token
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 *       404:
 *          description: User not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error404'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#definitions/Error'
 */
authRouter.post(
  '/reset-password',
  requireToken(true),
  validate([...passwordValidator(), ...confirmPasswordValidator()]),
  authController.resetPassword
);

export { authRouter };
