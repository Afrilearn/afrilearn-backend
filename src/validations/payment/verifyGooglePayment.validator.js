import { check, validationResult } from 'express-validator';

/**
 *Contains AddTransaction Validator
 *
 *
 *
 * @class AddTransaction
 */
class verifyGooglePayment {
  /**
   * validate AddTransaction data.
   * @memberof AddTransaction
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check('purchaseToken')
        .exists()
        .withMessage('Purchase Token is required')
        .not()
        .isEmpty()
        .withMessage('Purchase Token cannot be empty'),       
      check('productId')
        .exists()
        .withMessage('Product Id is required')
        .not()
        .isEmpty()
        .withMessage('ProductId cannot be empty'),       
      check('courseId')
        .exists()
        .withMessage('Course Id is required')
        .not()
        .isEmpty()    
        .withMessage('Course Id cannot be empty'), 
      check('clientUserId')
        .exists()
        .withMessage('client User Id is required')
        .not()
        .isEmpty()    
        .withMessage('client User Id cannot be empty'),   
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
export default verifyGooglePayment;
