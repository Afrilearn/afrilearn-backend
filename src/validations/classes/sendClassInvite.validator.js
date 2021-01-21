import { check, validationResult } from 'express-validator';

/**
 *Contains SendClassInvite Validator
 *
 *
 *
 * @class SendClassInvite
 */
class SendClassInvite {
  /**
   * validate class request data.
   * @memberof SendClassInvite
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check('link')
        .exists()
        .withMessage('link is required')
        .isURL()
        .withMessage('link should be a URL'),
      check('email')
        .exists()
        .withMessage('email is required')
        .isEmail()
        .withMessage('email should be an Email'),
    ];
  }

  /**
   * Validate class request data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SendClassInvite
   * @returns {JSON} - A JSON success response.
   */
  static async myValidationResult(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArr = errors.array().map(({ msg }) => msg);
      return res.status(400).json({
        status: '400 Invalid Request',
        error: 'Your request contains invalid parameters',
        errors: errArr,
      });
    }
    return next();
  }
}
export default SendClassInvite;
