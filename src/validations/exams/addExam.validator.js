import { check, validationResult } from "express-validator";

class AddExamValidator {
  static validateData() {
    return [
      check("subjectId")
        .exists()
        .withMessage("Subject ID is required")
        .isMongoId()
        .withMessage("Subject ID should be a mongoID"),
      check("termId")
        .exists()
        .withMessage("Term ID is required")
        .isMongoId()
        .withMessage("Term ID should be a mongoID"),
      check("questionTypeId")
        .exists()
        .withMessage("Question Type ID is required")
        .isMongoId()
        .withMessage("Question Type ID should be a mongoID"),

      check("title")
        .exists()
        .withMessage("title is required")
        .isString()
        .withMessage("title should be a string"),
      check("duration")
        .exists()
        .withMessage("duration is required")
        .isNumeric()
        .withMessage("duration should be a Number"),
      check("instruction")
        .exists()
        .withMessage("instruction is required")
        .isString()
        .withMessage("instruction should be a string"),
      check("totalNumberOfQuestions")
        .exists()
        .withMessage("totalNumberOfQuestions is required")
        .isNumeric()
        .withMessage("totalNumberOfQuestions should be a Number"),
      check("deadline")
        .exists()
        .withMessage("deadline is required")
        .isString()
        .withMessage("deadline should be a String"),
    ];
  }

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
export default AddExamValidator;
