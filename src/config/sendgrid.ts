import sgMail from '@sendgrid/mail';

import { SENDER_EMAIL } from '../constants';
import { logger } from '../shared/winston';
import { environment } from './environment';

export interface Email {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

sgMail.setApiKey(environment.sendgridApiKey);

export const sendEmail = async (email: Email) => {
  const message = {
    from: SENDER_EMAIL,
    ...email,
  };

  // Don't send emails in development
  if (environment.env !== 'production') {
    logger.info(JSON.stringify(message));

    return;
  }

  try {
    await sgMail.send(message);
    logger.info('Mail sent');
  } catch (error) {
    logger.error(error);

    if (error.response) {
      logger.error(error.response.body);
    }
  }
};
