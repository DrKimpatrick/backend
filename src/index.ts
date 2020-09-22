import 'module-alias/register';
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';

import { logger } from '@shared/winston';
import { v1Router } from '@api/router';

dotenv.config();

const app = express();
const PORT = 3500 || process.env.PORT;
const db = mongoose.connection;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1', v1Router);

app.get('*', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

mongoose.connect(process.env.DB_URI as string, { useNewUrlParser: true, useUnifiedTopology: true });

db.on('error', (err) => logger.error(err));
db.once('open', () => {
  logger.info('💾 Database connected');

  app.listen(PORT, () => {
    logger.info(`⚡️ Server is running at http://localhost:${PORT}`);
  });
});

export { app };
