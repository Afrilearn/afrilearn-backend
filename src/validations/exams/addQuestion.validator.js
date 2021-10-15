import { check, validationResult } from "express-validator";

class AddQuestionValidator {
  static validateData() {
    return [
      check("examId")
        .exists()
        .withMessage("Exam ID is required")
        .isMongoId()
        .withMessage("Exam ID should be a mongoID"),
      check("question")
        .exists()
        .withMessage("question is required")
        .isString()
        .withMessage("question should be a string"),
      check("options")
        .exists()
        .withMessage("options are required")
        .isArray()
        .withMessage("options should be an Array"),
      check("correct_option")
        .exists()
        .withMessage("correct_option is required")
        .isNumeric()
        .withMessage("correct_option should be a Number"),
      check("mark_weight")
        .exists()
        .withMessage("mark_weight is required")
        .isNumeric()
        .withMessage("mark_weight should be a Number"),
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
export default AddQuestionValidator;
