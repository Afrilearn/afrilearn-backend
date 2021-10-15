import { check, validationResult } from "express-validator";

class AddQuestionTypeValidator {
  static validateData() {
    return [
      check("name")
        .exists()
        .withMessage("name is required")
        .isString()
        .withMessage("name should be a string"),
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
export default AddQuestionTypeValidator;
