import { check, validationResult } from 'express-validator';

/**
 *Contains AddClassValidator Validator
 *
 *
 *
 * @class AddClassValidator
 */
class AddClassValidator {
  /**
   * validate AddClass data.
   * @memberof AddClassValidator
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check('name')
        .exists()
        .withMessage('Name is required')
        .not()
        .isEmpty()
        .withMessage('Name cannot be empty'),
      check('courseId')
        .exists()
        .withMessage('Class ID is required')
        .isMongoId()
        .withMessage('Class ID should be a mongoID'),
    ];
  }

  /**
   * Validate class data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof AddClassValidator
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
export default AddClassValidator;
