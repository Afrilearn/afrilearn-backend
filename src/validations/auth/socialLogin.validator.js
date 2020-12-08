import { check, validationResult } from 'express-validator';

/**
 *Contains Login Validator
 *
 *
 *
 * @class Login
 */
class Login {
  /**
     * validate user data.
     * @memberof Login
     * @returns {null} - No response.
     */
  static validateData() {
    return [
      check('token')
        .exists()
        .withMessage('Token is required')
        .not()
        .isEmpty()
        .withMessage('Token cannot be empty'),
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
        errors: errArr,
      });
    }
    return next();
  }
}
export default Login;
