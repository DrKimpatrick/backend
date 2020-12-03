// @ts-ignore
import mailchimp_transactional from '@mailchimp/mailchimp_transactional';
import { SENDER_EMAIL } from '../constants';
import { logger } from '../shared/winston';
import { environment } from './environment';

export interface Email {
  subject: string;
  html: string;
  to: [
    {
      email: string;
      type: 'to' | 'cc' | 'bcc';
    }
  ];
}

const mailchimp = mailchimp_transactional(environment.mailchimpApiKey);

export const sendEmail = async (email: Email) => {
  const message = {
    from_email: SENDER_EMAIL,
    ...email,
  };

  // Don't send emails in development
  if (environment.env === 'development') {
    logger.info(JSON.stringify(message));

    return;
  }

  try {
    await mailchimp.messages.send({
      message,
    });

    return;
  } catch (error) {
    logger.error(error);
  }
};
