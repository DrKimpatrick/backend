import { NextFunction, Request, Response } from 'express';
import { MODELS, STATUS_CODES, USER_ROLES } from '../constants';
import { environment } from '../config/environment';
import { ModelFactory } from '../models/model.factory';
import IUser from '../models/interfaces/user.interface';
import { logger } from '../shared/winston';
import { decodeJWT, getTokenFromRequest } from '../helpers/auth.helpers';

export const requireToken = (isTokenInBodyParams = false) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const doNotRequireTokenUrls = new RegExp(
    `^((${environment.apiPrefix}/auth.*)|(${environment.apiPrefix}/users/beta-testers))$`,
    'i'
  );

  if (doNotRequireTokenUrls.test(req.url)) {
    // if url is not required to have a token and the token is indeed not provided, just proceed
    // to next handler, unless if a token is provided even when it is not required
    return next();
  }

  try {
    const token = getTokenFromRequest(req, isTokenInBodyParams);
    if (!token) return res.status(STATUS_CODES.UNAUTHORIZED).json({ error: 'Missing token' });

    const data = decodeJWT(token);
    if (!data) return res.status(STATUS_CODES.UNAUTHORIZED).json({ error: 'Invalid token' });

    const { payload } = data;

    const userModel = ModelFactory.getModel<IUser>(MODELS.USER);
    const user = await userModel.findById(payload.userId);
    if (!user) return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });

    req.currentUser = user;
    req.currentUser.isSuperAdmin = user.isSuperAdmin;
    return next();
  } catch (error) {
    logger.error(error.message);
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ error: 'Token is invalid or expired' });
  }
};

export const requireRoles = (roles: USER_ROLES[], checkAll = true) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ message: 'You are unauthorized to perform this action' });
  }

  let authorized;
  if (checkAll) {
    for (const i in roles) {
      if (req.currentUser?.roles?.includes(roles[i])) {
        authorized = true;
      }
    }
  } else {
    authorized = roles.some((role) => req.currentUser?.roles?.includes(role) as boolean);
  }

  // super_admin have access to all endpoints
  if (authorized || req.currentUser?.roles?.includes(USER_ROLES.SUPER_ADMIN)) {
    return next();
  }

  return res
    .status(STATUS_CODES.FORBIDDEN)
    .json({ message: 'You do not have the permissions to perform this operation' });
};
