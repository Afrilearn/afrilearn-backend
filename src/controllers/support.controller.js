import SupportRequest from '../db/models/supportRequest.model';
import sendEmail from '../utils/email.utils';

/**
 *Contains SupportRequest Controller
 *
 *
 *
 * @class SupportRequestController
 */
class SupportRequestController {
  /**
   * Add a SupportRequest test
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof SupportRequestController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addSupportRequest(req, res) {
    try {
      const supportRequest = await SupportRequest.create({ ...req.body });

      sendEmail(
        req.body.email,
        req.body.subject,
        'Your Support request was recieved, a team member will contact you.',
      );
      sendEmail(
        'afrilearners@gmail.com',
        req.body.subject,
        `A Support request was sent by ${req.body.email}.`,
      );

      return res.status(200).json({
        status: 'success',
        data: {
          supportRequest,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Saving Support Request',
      });
    }
  }
}
export default SupportRequestController;
