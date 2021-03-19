import { check, validationResult } from "express-validator";

/**
 *Contains SaveQuizResults Validator
 *
 *
 *
 * @class SaveQuizResults
 */
class SaveQuizResults {
  /**
   * validate SaveQuizResults data.
   * @memberof SaveQuizResults
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check("results")
        .exists()
        .withMessage("Results is required")
        .isArray()
        .withMessage("Results should be an array"),
      check("userId")
        .exists()
        .withMessage("User ID is required")
        .isMongoId()
        .withMessage("User ID should be a mongoID"),
      check("courseId")
        .exists()
        .withMessage("Course ID is required")
        .isMongoId()
        .withMessage("Course ID should be a mongoID"),
      check("lessonId")
        .exists()
        .withMessage("Lesson ID is required")
        .isMongoId()
        .withMessage("Lesson ID should be a mongoID"),
      check("timeSpent")
        .isString()
        .withMessage("Time spent is type String"),
      check("numberOfCorrectAnswers")
        .isInt()
        .withMessage("Number of Correct Answers is an Integer"),
      check("numberOfWrongAnswers")
        .isInt()
        .withMessage("Number of Wrong Answers is an Integer"),
      check("numberOfSkippedQuestions")
        .isInt()
        .withMessage("Number of Skipped Answers is an Integer"),
      check("score")
        .isInt()
        .withMessage("Score is an Integer"),
      check("remark")
        .isString()
        .withMessage("Remark is type String"),
    ];
  }

  /**
   * Validate results data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SaveQuizResults
   * @returns {JSON} - A JSON success response.
   */
  static async myValidationResult(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArr = errors.array().map(({ msg }) => msg);
      return res.status(400).json({
        status: "400 Invalid Request",
        error: "Your request contains invalid parameters",
        errors: errArr,
      });
    }
    return next();
  }
}
export default SaveQuizResults;
