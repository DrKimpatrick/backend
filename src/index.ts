import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUiExpress from 'swagger-ui-express';

import { v1Router } from './api/router';
import swaggerConfig from './config/swagger';
import passport from 'passport';
import cache from './shared/cache';

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
  '/api/v1/docs',
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(swaggerConfig, { explorer: true })
);

app.use('/api/v1', v1Router);

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
