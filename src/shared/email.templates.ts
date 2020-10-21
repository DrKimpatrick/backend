import ejs from 'ejs';

/**
 * @function getEmailBody
 * @description helper to format an email body
 * @param {string} pathToTemplate - Path to the template
 * @param {object} ejsData - Data used in the template
 */
export const getEmailTemplate = (pathToTemplate: string, ejsData: object): Promise<string> =>
  new Promise((resolve, reject) => {
    ejs.renderFile(pathToTemplate, { ...ejsData }, (err: any, str: string) => {
      if (err) {
        reject(err);
      }

      resolve(str);
    });
  });
