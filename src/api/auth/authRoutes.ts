import { Router } from 'express';
import { authController } from './authController';

const authRouter = Router();

authRouter.get('/login', authController.login);

export { authRouter };
