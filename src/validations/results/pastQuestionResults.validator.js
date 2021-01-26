import { check, validationResult } from 'express-validator';

/**
 *Contains SavePastQuestionResults Validator
 *
 *
 *
 * @class SavePastQuestionResults
 */
class SavePastQuestionResults {
  /**
   * validate SavePastQuestionResults data.
   * @memberof SavePastQuestionResults
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check('results')
        .exists()
        .withMessage('Results is required')
        .not()
        .isEmpty()
        .withMessage('Results cannot be empty')
        .isArray()
        .withMessage('Results should be an array'),
      check('userId')
        .exists()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('User ID should be a mongoID'),
      check('courseId')
        .exists()
        .withMessage('Course ID is required')
        .isMongoId()
        .withMessage('Course ID should be a mongoID'),
      check('pastQuestionCategoryId')
        .exists()
        .withMessage('Past Question Category ID is required')
        .isInt()
        .withMessage('Past Question Category ID should be a number'),
      check('timeSpent')
        .exists()
        .withMessage('Time spent is required')
        .not()
        .isEmpty()
        .withMessage('Time spent cannot be empty')
        .isString()
        .withMessage('Time spent is type String'),
      check('numberOfCorrectAnswers')
        .exists()
        .withMessage('Number of Correct Answers is required')
        .isInt()
        .withMessage('Number of Correct Answers is an Integer'),
      check('numberOfWrongAnswers')
        .exists()
        .withMessage('Number of Wrong Answers is required')
        .isInt()
        .withMessage('Number of Wrong Answers is an Integer'),
      check('numberOfSkippedQuestions')
        .exists()
        .withMessage('Number of Skipped Answers is required')
        .isInt()
        .withMessage('Number of Skipped Answers is an Integer'),
      check('score')
        .exists()
        .withMessage('Score is required')
        .isInt()
        .withMessage('Score is an Integer'),
      check('remark')
        .exists()
        .withMessage('Remark is required')
        .not()
        .isEmpty()
        .withMessage('Remark cannot be empty')
        .isString()
        .withMessage('Remark is type String'),
    ];
  }

  /**
   * Validate results data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SavePastQuestionResults
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
export default SavePastQuestionResults;
