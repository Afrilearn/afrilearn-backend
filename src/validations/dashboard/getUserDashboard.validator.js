import { check, validationResult } from 'express-validator';

/**
 *Contains GetUserDashboard Validator
 *
 *
 *
 * @class GetUserDashboard
 */
class GetUserDashboard {
  /**
   * validate getDashboard data.
   * @memberof GetUserDashboard
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check('enrolledCourseId')
        .exists()
        .withMessage('Enrolled Course ID is required')
        .isMongoId()
        .withMessage('Enrolled Course ID should be a mongoID'),
    ];
  }

  /**
   * Validate getDashboard data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof GetUserDashboard
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
export default GetUserDashboard;
