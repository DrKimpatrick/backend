import path from 'path';
import ejs from 'ejs';
import { environment } from '../config/environment';

export const getWelcomeEmail = (username: string, token: string): Promise<string> =>
  new Promise((resolve, reject) => {
    ejs.renderFile(
      path.join(__dirname, '../', 'templates/account-confirmation.ejs'),
      { username, token, baseUrl: environment.baseUrl },
      (err: any, str: string) => {
        if (err) {
          reject(err);
        }

        resolve(str);
      }
    );
  });
