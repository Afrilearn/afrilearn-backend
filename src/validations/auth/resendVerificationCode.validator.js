import { check, validationResult } from 'express-validator';
/**
 *Contains PasswordReset Validator
 *
 *
 *
 * @class PasswordReset
 */
class ResendVerificationCode {
  /**
     * validate user data.
     * @memberof PasswordReset
     * @returns {null} - No response.
     */
  static validateData() {
    return [
      check('email')
        .exists()
        .withMessage('Email is required')
        .not()
        .isEmpty()
        .withMessage('Email cannot be empty')
        .isEmail()
        .withMessage('Email should be a valid email address')
    ];
  }

  /**
   * Validate user data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof Login
   * @returns {JSON} - A JSON success response.
   */
  static async myValidationResult(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArr = errors.array().map(({ msg }) => msg);
      return res.status(400).json({
        status: '400 Invalid Request',
        error: 'Your request contains invalid parameters',
        errors: errArr
      });
    }
    return next();
  }
}
export default ResendVerificationCode;
