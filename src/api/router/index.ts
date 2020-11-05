import { Router } from 'express';
import { authRouter } from '../auth/auth.routes';
import { userRouter } from '../users/user.routes';
import { skillRouter } from '../skills/skills.routes';
import { educationRouter } from '../education/education.routes';

const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/users', userRouter);
v1Router.use('/skills', skillRouter);
v1Router.use('/education', educationRouter);

export { v1Router };
