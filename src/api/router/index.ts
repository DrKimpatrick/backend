import { Router } from 'express';
import { authRouter } from '../auth/auth.routes';
import { userRouter } from '../users/user.routes';
import { skillRouter } from '../skills/skills.routes';
import { educationRouter } from '../education/education.routes';
import { employmentRouter } from '../employment/employment.routes';
import { courseRouter } from '../course/course.routes';

const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/users', userRouter);
v1Router.use('/skills', skillRouter);
v1Router.use('/education', educationRouter);
v1Router.use('/employment', employmentRouter);
v1Router.use('/courses', courseRouter);

export { v1Router };
