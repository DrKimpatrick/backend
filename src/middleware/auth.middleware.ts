import { NextFunction, Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { MODELS, STATUS_CODES, USER_ROLES } from '../constants';
import { environment } from '../config/environment';
import { ModelFactory } from '../models/model.factory';
import IUser from '../models/interfaces/user.interface';
import { BaseTokenPayload } from '../interfaces';
import { logger } from '../shared/winston';

export const requireToken = (isTokenInQueryParams = false) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = isTokenInQueryParams
    ? (req.query.token as string)
    : req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(STATUS_CODES.UNAUTHORIZED).json({ error: 'Missing token' });

  try {
    const payload = jsonwebtoken.verify(token, environment.secretKey) as BaseTokenPayload;
    const userModel = ModelFactory.getModel<IUser>(MODELS.USER);
    const user = await userModel.findById(payload.userId);

    if (!user) return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    if (isTokenInQueryParams && user.verified) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: 'User account already verified' });
    }

    req.currentUser = user;
    return next();
  } catch (error) {
    logger.error(error.message);
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ error: 'Token is invalid or expired' });
  }
};

export const requireRoles = (roles: USER_ROLES[]) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ message: 'You are unauthorized to perform this aciton' });
  }

  let authorized = false;

  roles.forEach((role) => {
    authorized = req.currentUser?.roles.includes(role) as boolean;
  });

  // super_admin have access to all endpoints
  if (authorized || req.currentUser?.roles.includes(USER_ROLES.SUPER_ADMIN)) {
    return next();
  }

  return res
    .status(STATUS_CODES.FORBIDDEN)
    .json({ message: 'You do not have the permissions to perform this operation' });
};
