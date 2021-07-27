import {
  check,
  validationResult
} from 'express-validator';

/**
 *Contains CommentValidator
 *
 *
 *
 * @class CommentValidator
 */
class CommentValidator {
  /**
   * validate Add/Remove comment data.
   * @memberof CommentValidator
   * @returns {null} - No response.
   */
  static validateAddChallengeResult() {
    return [
      check('challengeId')
      .exists()
      .withMessage('Challenge ID is required')
      .isMongoId()
      .withMessage('Challenge ID should be a mongoID'),
      check('userId')
      .exists()
      .withMessage('User ID is required')
      .isMongoId()
      .withMessage('User ID should be a mongoID'),
      check('totalQuestionsAnswered')
      .exists()
      .withMessage('Total question number is required')
      .not()
      .isEmpty()
      .withMessage('Total question must not be empty'),
      check('numOfCorrectAnswers')
      .exists()
      .withMessage('Correct answer is required')
      .not()
      .isEmpty()
      .withMessage('Correct answer must not be empty'),
      check('winRatio')
      .exists()
      .withMessage('Win ratio is required')
      .not()
      .isEmpty()
      .withMessage('Win ratio must not be empty'),
    ];
  }
  

  /**
   * validate Add EnrolledCourse data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof CommentValidator
   * @returns {JSON} - A JSON success response.
   */
  static async myValidationResult(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArr = errors.array().map(({
        msg
      }) => msg);
      return res.status(400).json({
        status: '400 Invalid Request',
        error: 'Your request contains invalid parameters',
        errors: errArr,
      });
    }
    return next();
  }
}
export default CommentValidator;