import express, { NextFunction } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUiExpress from 'swagger-ui-express';

import { v1Router } from './api/router';
import swaggerConfig from './config/swagger';
import passport from 'passport';
import cache from './shared/cache';
import { environment } from './config/environment';
import { requireToken } from './middleware/auth.middleware';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  `${environment.apiPrefix}/docs`,
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(swaggerConfig, { explorer: true })
);

app.all('*', requireToken(), (err: any, req: any, res: any, next: NextFunction) => {
  if (err.name === 'UnauthorizedError') {
    res.status(err.status).send({ message: err.message });
    return;
  }
  next();
});

app.use(environment.apiPrefix, v1Router);

app.get('*', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

cache.init();

passport.serializeUser((user: any, done: (...args: any) => void) => {
  done(null, user);
});

passport.deserializeUser((user: any, done: (...args: any) => void) => {
  done(null, user);
});

require('./config/passport');

export { app };
