import sgMail from '@sendgrid/mail';
import { config } from 'dotenv';
import logger from '../config';

config();
// Setup this key on your .env
sgMail.setApiKey(process.env.SEND_GRID_API);
/**
 * @param {String} to The user's email
 * @param {String} subject The email subject
 * @param {String} message The mail content
 * @returns {object} An email on user's email
 */
async function sendEmail(to, subject = 'Afrilearn', message) {
  const msg = {
    to,
    from: 'afrilearners@gmail.com',
    subject,
    text: message,
    html: message,
  };
  try {
    await sgMail.send(msg);
    logger.info('Successfully Sent');
  } catch (err) {
    // logger.error(err);
  }
}

export default sendEmail;
