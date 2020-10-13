import { getWelcomeEmail } from '../../shared/email.templates';
import { Email, sendEmail } from '../mailchimp';

describe(sendEmail, () => {
  it('should send email when called', async () => {
    const testEmail: Email = {
      subject: '',
      html: await getWelcomeEmail('user', 'http://some.link'),
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
