import { check, validationResult } from 'express-validator';

/**
 *Contains AddPastQuestionProgressValidator Validator
 *
 *
 *
 * @class AddPastQuestionProgressValidator
 */
class AddPastQuestionProgressValidator {
  /**
   * validate Add EnrolledCourse data.
   * @memberof AddPastQuestionProgressValidator
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check('courseId')
        .exists()
        .withMessage('Course ID is required')
        .isMongoId()
        .withMessage('Course ID should be a mongoID'),
    ];
  }

  /**
   * validate Add EnrolledCourse data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof AddPastQuestionProgressValidator
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
export default AddPastQuestionProgressValidator;
