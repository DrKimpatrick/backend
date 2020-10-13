import jsonwebtoken from 'jsonwebtoken';
import { environment } from '../config/environment';

export const generateVerificationToken = (userId: string) => {
  return jsonwebtoken.sign(
    {
      id: userId,
    },
    environment.secretKey
  );
};
