import { NextFunction, Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { MODELS, STATUS_CODES } from '../constants';
import { environment } from '../config/environment';
import { ModelFactory } from '../models/model.factory';
import IUser from '../models/interfaces/user.interface';
import { AccountVerificationTokenPayload } from '../interfaces';
import { logger } from '../shared/winston';

export const checkAccountVerificationToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.query.token as string;

  if (!token) return res.status(STATUS_CODES.UNAUTHORIZED).json({ error: 'Missing token' });

  try {
    const payload = jsonwebtoken.verify(
      token,
      environment.secretKey
    ) as AccountVerificationTokenPayload;
    const userModel = ModelFactory.getModel<IUser>(MODELS.USER);
    const user = await userModel.findById(payload.id);

    if (!user) return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    if (user.verified) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: 'User account already verified' });
    }

    req.currentUser = user;
    return next();
  } catch (error) {
    logger.error(error);
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ error: 'Invalid token' });
  }
};

export const checkAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  // TODO:
};
