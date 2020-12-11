import { Response } from 'express';
import { logger } from '../shared/winston';

class HttpError extends Error {
  /**
   * @param {number} statusCode Http error status code
   * @param {string} message Http error message
   * @param {Error} errorInstance Optional error instance
   */
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly errorInstance?: Error
  ) {
    super();
  }
}

const handleHttpError = (err: HttpError, res: Response) => {
  const { statusCode, message } = err;

  logger.error(err.errorInstance?.stack ?? message);

  return res.status(statusCode).json({
    statusCode,
    message,
  });
};

export { HttpError, handleHttpError };
