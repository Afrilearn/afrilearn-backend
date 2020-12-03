import { check, validationResult } from 'express-validator';
import AuthServices from '../../services/auth.services';

/**
 *Contains Signup Validator
 *
 *
 *
 * @class AccountActivation
 */
class AccountActivation {
  /**
     * validate user data.
     * @memberof AccountActivation
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
      check('passcode')
        .exists()
        .withMessage('Passcode is required')
        .not()
        .isEmpty()
        .withMessage('Passcode cannot be empty')
        .trim()
        .escape()
    ];
  }

  /**
   * Validate user data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SignUp
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

  /**
   * Check whether email already exist.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SignUp
   * @returns {JSON} - A JSON response.
   */
  static async emailAlreadyExist(req, res, next) {
    const { email } = req.body;
    const user = await AuthServices.emailExist(email, res);
    if (!user.length) {
      return res.status(400).json({
        status: '400 Invalid Request',
        error: 'User record not found'
      });
    }
    req.body._id = user[0]._id;
    return next();
  }

  /**
   * Check whether activation code is valid.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SignUp
   * @returns {JSON} - A JSON response.
   */
  static async confirmActivationCode(req, res, next) {
    const { _id, passcode } = req.body;
    const user = await AuthServices.matchCode(_id, passcode, res);
    if (!user) {
      return res.status(400).json({
        status: '400 Invalid Request',
        error: 'Wrong activation code'
      });
    }
    return next();
  }
}
export default AccountActivation;
