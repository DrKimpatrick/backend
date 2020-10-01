import { Router } from 'express';
import { AuthController } from './auth.controller';

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
authRouter.get('/login', AuthController.login);

export { authRouter };
