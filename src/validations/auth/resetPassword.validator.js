import { check, validationResult } from 'express-validator';
import AuthServices from '../../services/auth.services';
/**
 *Contains PasswordReset Validator
 *
 *
 *
 * @class PasswordReset
 */
class PasswordReset {
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
        .withMessage('Email should be a valid email address'),
      check('password')
        .exists()
        .withMessage('Password is required')
        .not()
        .isEmpty()
        .withMessage('Password cannot be empty')
        .trim()
        .escape(),
      check('code')
        .exists()
        .withMessage('Code is required')
        .not()
        .isEmpty()
        .withMessage('Code cannot be empty')
        .trim()
        .escape(),
    ];
  }

  /**
   * Validate user data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof PasswordReset
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

  /**
   * Check whether email already exist.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SignUp
   * @returns {JSON} - A JSON response.
   */
  static async emailAlreadyExist(req, res, next) {
    const { email } = req.params;
    const user = await AuthServices.emailExist(email, res);
    if (!user) {
      return res.status(401).json({
        status: '401 Unauthorized',
        error: 'User not found',
      });
    }
    return next();
  }

  /**
   * Verify reset password token.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SignUp
   * @returns {JSON} - A JSON response.
   */
  static async verifyPasscode(req, res, next) {
    const { email, code } = req.body;
    const result = await AuthServices.verifyPasscode(email, code, res);
    if (result === 2) {
      return res.status(401).json({
        status: '401 Unauthorized',
        error: 'Passcode is Invalid',
      });
    } if (result === 3) {
      return res.status(401).json({
        status: '401 Unauthorized',
        error: 'Passcode has expired',
      });
    }
    return next();
  }
}
export default PasswordReset;
