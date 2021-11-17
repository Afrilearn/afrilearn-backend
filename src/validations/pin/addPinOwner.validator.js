import { check, validationResult } from "express-validator";

class AddPinOwnerValidator {
  static validateAddPinOwner() {
    return [
      check("email")
        .exists()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is not valid"),
      check("fullName")
        .exists()
        .withMessage("Full Name is required")
        .isString()
        .withMessage("Full Name should be a string"),
      check("password")
        .exists()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password should be a string"),
      check("phoneNumber")
        .exists()
        .withMessage("Phone Number is required")
        .isString()
        .withMessage("Phone Number should be a string"),
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
export default AddPinOwnerValidator;
