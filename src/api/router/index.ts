import { Router } from 'express';
import { authRouter } from '@api/auth/authRoutes';

const v1Router = Router();

v1Router.use('/auth', authRouter);

export { v1Router };
