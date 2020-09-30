import { Router } from 'express';
import { AuthController } from './auth.controller';

const authRouter = Router();

authRouter.get('/login', AuthController.login);

export { authRouter };
