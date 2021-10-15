import { check, validationResult } from "express-validator";

class AddResultExamValidator {
  static validateData() {
    return [
      check("results")
        .exists()
        .withMessage("Results are required")
        .isArray()
        .withMessage("Results should be an Array"),
      check("examId")
        .exists()
        .withMessage("Exam ID is required")
        .isMongoId()
        .withMessage("Exam ID should be a mongoID"),
      check("timeSpent")
        .exists()
        .withMessage("timeSpent is required")
        .isString()
        .withMessage("timeSpent should be a string"),
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
export default AddResultExamValidator;
