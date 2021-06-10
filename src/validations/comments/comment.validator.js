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
  static validateAddComment() {
    return [
      check('userId')
      .exists()
      .withMessage('User ID is required')
      .isMongoId()
      .withMessage('User ID should be a mongoID'),
      check('lessonId')
      .exists()
      .withMessage('Lesson ID is required')
      .isMongoId()
      .withMessage('Lesson ID should be a mongoID'),
      check('text')
      .exists()
      .withMessage('Comment text is required')
      .not()
      .isEmpty()
      .withMessage('Comment text must not be empty'),
      check('commentSection')
      .exists()
      .withMessage('Comment Section is required')
      .not()
      .isEmpty()
      .withMessage('Comment Section must not be empty')
    ];
  }

  /**
   * validate like and unlike lesson comment.
   * @memberof CommentValidator
   * @returns {null} - No response.
   */
  static validateLikeComment() {
    return [
      check('userId')
      .exists()
      .withMessage('User ID is required')
      .isMongoId()
      .withMessage('User ID should be a mongoID'),
      check('lessonCommentId')
      .exists()
      .withMessage('Comment ID is required')
      .isMongoId()
      .withMessage('Commend ID should be a mongoID')
    ];
  }

  /**
   * validate get lesson comments.
   * @memberof CommentValidator
   * @returns {null} - No response.
   */
  static validateGetLessonComments() {
    return [
      check('commentSection')
      .exists()
      .withMessage('Comment Section is required')
      .not()
      .isEmpty()
      .withMessage('Comment Section must not be empty')
    ];
  }

  /**
   * validate Add comment reply data.
   * @memberof CommentValidator
   * @returns {null} - No response.
   */
  static validateAddCommentReply() {
    return [
      check('userId')
      .exists()
      .withMessage('User ID is required')
      .isMongoId()
      .withMessage('User ID should be a mongoID'),
      check('lessonCommentId')
      .exists()
      .withMessage('Lesson Comment Id is required')
      .isMongoId()
      .withMessage('Lesson Comment Id should be a mongoID'),
      check('text')
      .exists()
      .withMessage('Comment Reply text is required')
      .not()
      .isEmpty()
      .withMessage('Comment Reply text must not be empty')
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