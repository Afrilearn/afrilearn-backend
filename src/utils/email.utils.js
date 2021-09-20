import NodeMailer from 'nodemailer';
import inlineBase64 from 'nodemailer-plugin-inline-base64';
import mg from 'nodemailer-mailgun-transport';
import validate from 'deep-email-validator';
import { config } from "dotenv";
import logger from "../config";

config();

/**
 * @param {String} to The user's email
 * @param {String} subject The email subject
 * @param {String} message The mail content
 * @returns {object} An email on user's email
 */
async function sendEmail(to, subject = "Afrilearn", message) {
  try {

    const auth = {
      auth: {
        api_key: process.env.MAILGUN,
        domain: process.env.MAILGUN_DOMAIN,
        pool: true,
        maxMessages: Infinity,
        maxConnections: 10
      }
    }
    const transporter = NodeMailer.createTransport(mg(auth));
    transporter.use('compile', inlineBase64());
  
    let res = await validate({
      email: to,
      validateRegex: true,
      validateMx: true,
      validateTypo: false,
      validateDisposable: true,
      validateSMTP: false,
    })
    const validateEmail = (email) => {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    };
    
    if(validateEmail(to)){      
      let mailDetail = {
        from: 'Afrilearn Education <care@myafrilearn.com>',
        to: to,
        subject,
        html:message,
        forceEmbeddedImages: true
      };
  
      transporter.sendMail(mailDetail, (err, resp) => {
        if (err) {
          logger.info(`This email ${to} was not sent. Err:${err}`) 
          if(err.status !== 400){
            sendEmail(to, subject, message) 
          }
             
        }
        else {
          logger.info(`Mail-->${to} was sent successfully`)       
        }
      }); 
    }else{
      logger.info(`This email ${to} is not valid`) 
    }   
  } catch (err) {
    // logger.error(err);
  }
}

export default sendEmail;
