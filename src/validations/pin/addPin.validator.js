import { check, validationResult } from "express-validator";

class AddPinValidator {
  static validateAddPin() {
    return [
      check("email")
        .exists()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is not valid"),
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
export default AddPinValidator;
