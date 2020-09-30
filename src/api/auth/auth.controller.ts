import { Request, Response } from 'express';

/**
 * @function authController
 * @description Handles all auth related business logic
 *
 */
export const authController = (() => {
  function handleLogin(req: Request, res: Response) {
    return res.status(200).json({ message: 'Logged in' });
  }

  return {
    login: handleLogin,
  };
})();

export { authController as AuthController };
