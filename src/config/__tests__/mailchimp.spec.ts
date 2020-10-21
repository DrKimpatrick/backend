import path from 'path';
import { getEmailTemplate } from '../../shared/email.templates';
import { Email, sendEmail } from '../mailchimp';

describe(sendEmail, () => {
  const pathToTemplate = path.join(__dirname, '../../', 'templates/account-confirmation.ejs');
  const ejsData = {
    username: 'user',
    token: 'token',
    baseUrl: 'http://baseUrl/',
  };
  it('should send email when called', async () => {
    const testEmail: Email = {
      subject: '',
      html: await getEmailTemplate(pathToTemplate, ejsData),
      to: [
        {
          email: '',
          type: 'to',
        },
      ],
    };
    const message = await sendEmail(testEmail);

    expect(message).toBe('Test Email Sent');
  });
});
