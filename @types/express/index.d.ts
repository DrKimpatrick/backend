import IUser from '../../src/models/interfaces/user.interface';

declare global {
  namespace Express {
    interface Request {
      currentUser?: IUser;
    }
  }
}
