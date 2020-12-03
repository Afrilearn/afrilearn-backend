import { check, validationResult } from 'express-validator';
import AuthServices from '../../services/auth.services';

/**
 *Contains Signup Validator
 *
 *
 *
 * @class SignUp
 */
class SignUp {
  /**
     * validate user data.
     * @memberof SignUp
     * @returns {null} - No response.
     */
  static validateData() {
    return [
      check('fullName')
        .exists()
        .withMessage('Fullname is required')
        .not()
        .isEmpty()
        .withMessage('Fullname  cannot be empty')
        .isLength({ min: 3 })
        .withMessage('Fullname  should be at least 3 characters long')
        .trim()
        .escape(),
      check('userName')
        .exists()
        .withMessage('Username is required')
        .not()
        .isEmpty()
        .withMessage('Username cannot be empty')
        .isLength({ min: 3 })
        .withMessage('Username be at least 3 characters long')
        .trim()
        .escape(),
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
        .isLength({ min: 6 })
        .withMessage('Password should be at least 6 characters long')
        .trim()
        .escape(),
      check('confirmPassword')
        .exists()
        .withMessage('Confirm password is required')
        .not()
        .isEmpty()
        .withMessage('Confirm password cannot be empty')
        .trim()
        .escape()
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Confirm password does not match'),
      check('gender')
        .exists()
        .withMessage('Gender is required')
        .not()
        .isEmpty()
        .withMessage('Gender cannot be empty')
        .trim()
        .escape(),
      check('country')
        .exists()
        .withMessage('Country is required')
        .not()
        .isEmpty()
        .withMessage('Country cannot be empty')
        .trim()
        .escape(),
      check('phoneNumber')
        .exists()
        .withMessage('Phone number is required')
        .not()
        .isEmpty()
        .withMessage('Phone number cannot be empty')
        .trim()
        .escape(),
      check('dayOfBirth')
        .exists()
        .withMessage('Day of birth is required')
        .not()
        .isEmpty()
        .withMessage('Day of birth cannot be empty')
        .trim()
        .escape(),
      check('monthOfBirth')
        .exists()
        .withMessage('Month of birth is required')
        .not()
        .isEmpty()
        .withMessage('Month Of birth cannot be empty')
        .trim()
        .escape(),
      check('yearOfBirth')
        .exists()
        .withMessage('Year Of birth is required')
        .not()
        .isEmpty()
        .withMessage('Year Of birth cannot be empty')
        .trim()
        .escape(),
      check('role')
        .exists()
        .withMessage('Profile category is equired')
        .not()
        .isEmpty()
        .withMessage('Profile category cannot be empty')
        .trim()
        .escape(),
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
    if (user.length) {
      return res.status(409).json({
        status: '409 Conflict',
        error: 'Email address already exists'
      });
    }
    return next();
  }

  /**
   * Check whether username already exist.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SignUp
   * @returns {JSON} - A JSON response.
   */
  static async usernameAlreadyExist(req, res, next) {
    const { userName } = req.body;
    const user = await AuthServices.usernameExist(userName, res);
    if (user.length) {
      return res.status(409).json({
        status: '409 Conflict',
        error: 'Username already exists'
      });
    }
    return next();
  }

  /**
   * Check whether phonenumber already exist.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SignUp
   * @returns {JSON} - A JSON response.
   */
  static async phonenumberAlreadyExist(req, res, next) {
    const { phoneNumber } = req.body;
    const user = await AuthServices.phoneExist(phoneNumber, res);
    if (user.length) {
      return res.status(409).json({
        status: '409 Conflict',
        error: 'Phonenumber already exists'
      });
    }
    return next();
  }
}
export default SignUp;
