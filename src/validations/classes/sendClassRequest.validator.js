import { check, validationResult } from 'express-validator';

/**
 *Contains SendClassRequest Validator
 *
 *
 *
 * @class SendClassRequest
 */
class SendClassRequest {
  /**
   * validate class request data.
   * @memberof SendClassRequest
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check('classId')
        .exists()
        .withMessage('Class ID is required')
        .isMongoId()
        .withMessage('Class ID should be a mongoID'),
    ];
  }

  /**
   * Validate class request data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SendClassRequest
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
export default SendClassRequest;
