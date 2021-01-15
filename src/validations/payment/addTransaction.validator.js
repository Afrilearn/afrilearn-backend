import { check, validationResult } from 'express-validator';

/**
 *Contains AddTransaction Validator
 *
 *
 *
 * @class AddTransaction
 */
class AddTransaction {
  /**
   * validate AddTransaction data.
   * @memberof AddTransaction
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check('tx_ref')
        .exists()
        .withMessage('tx_ref is required')
        .not()
        .isEmpty()
        .withMessage('tx_ref cannot be empty')
        .isString()
        .withMessage('tx_ref should be a string'),
      check('amount')
        .exists()
        .withMessage('amount is required')
        .not()
        .isEmpty()
        .withMessage('amount cannot be empty')
        .isInt()
        .withMessage('amount should be a number'),
      check('userId')
        .exists()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('User ID should be a mongoID'),
      check('paymentPlanId')
        .exists()
        .withMessage('paymentPlan ID is required')
        .isMongoId()
        .withMessage('paymentPlan ID should be a mongoID'),
    ];
  }

  /**
   * Validate results data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof AddTransaction
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
export default AddTransaction;
