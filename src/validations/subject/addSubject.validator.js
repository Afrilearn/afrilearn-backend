import { check, validationResult } from 'express-validator';

/**
 *Contains AddSubject Validator
 *
 *
 *
 * @class AddSubject
 */
class AddSubject {
  /**
   * validate AddSubject data.
   * @memberof AddSubject
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check('mainSubjectId')
        .exists()
        .withMessage('MainSubject ID is required')
        .isMongoId()
        .withMessage('MainSubject ID should be a mongoID'),
      check('courseId')
        .exists()
        .withMessage('Course ID is required')
        .isMongoId()
        .withMessage('Course ID should be a mongoID'),
    ];
  }

  /**
   * Validate results data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof AddSubject
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
export default AddSubject;
