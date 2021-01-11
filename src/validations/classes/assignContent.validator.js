import { check, validationResult } from 'express-validator';

/**
 *Contains AssignContent Validator
 *
 *
 *
 * @class AssignContent
 */
class AssignContent {
  /**
   * validate class request data.
   * @memberof AssignContent
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check('lessonId')
        .exists()
        .withMessage('Lesson ID is required')
        .isMongoId()
        .withMessage('Lesson ID should be a mongoID'),
      check('description')
        .exists()
        .withMessage('Description is required')
        .isString()
        .withMessage('Description should be a String'),
    ];
  }

  /**
   * Validate class request data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof AssignContent
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
export default AssignContent;
