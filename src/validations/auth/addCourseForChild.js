import { check, validationResult } from "express-validator";

/**
 *Contains AddCourseForChild Validator
 *
 *
 *
 * @class AddCourseForChild
 */
class AddCourseForChild {
  /**
   * validate user data.
   * @memberof AddCourseForChild
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check("email")
        .exists()
        .withMessage("Email is required")
        .not()
        .isEmpty()
        .withMessage("Email cannot be empty")
        .isEmail()
        .withMessage("Email should be a valid email address"),
      check("courseId")
        .exists()
        .withMessage("courseId is required")
        .isMongoId()
        .withMessage("courseId should be a MongoID"),
    ];
  }

  /**
   * Validate user data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof AddCourseForChild
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
export default AddCourseForChild;
