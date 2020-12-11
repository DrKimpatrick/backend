import { NextFunction, Request, Response } from 'express';
import { STATUS_CODES } from '../constants';

export const bodyArray = (message?: string) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (Array.isArray(req.body)) {
    return next();
  }
  return res
    .status(STATUS_CODES.BAD_REQUEST)
    .json({ message: message || 'Body should be an array' });
};

export const bodyNotArray = (message?: string) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (Array.isArray(req.body)) {
    return res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ message: message || 'Body should not be an array' });
  }
  return next();
};

export const bodyArrayNotEmpty = () => (req: Request, res: Response, next: NextFunction) => {
  if (!Array.isArray(req.body)) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Body should be an array' });
  }

  if (req.body.length === 0) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Empty body: No data submitted.' });
  }

  return next();
};
