import { check, validationResult } from "express-validator";

/**
 *Contains SchoolAddClassValidator Validator
 *
 *
 *
 * @class SchoolAddClassValidator
 */
class SchoolAddClassValidator {
  /**
   * validate AddClass data.
   * @memberof SchoolAddClassValidator
   * @returns {null} - No response.
   */
  static validateData() {
    return [
      check("name")
        .exists()
        .withMessage("Name is required")
        .not()
        .isEmpty()
        .withMessage("Name cannot be empty"),
      check("courseId")
        .exists()
        .withMessage("course ID is required")
        .isMongoId()
        .withMessage("course ID should be a mongoID"),
      check("schoolId")
        .exists()
        .withMessage("School ID is required")
        .isMongoId()
        .withMessage("School ID should be a mongoID"),
      check("teacherId")
        .exists()
        .withMessage("Teacher ID is required")
        .isMongoId()
        .withMessage("Teacher ID should be a mongoID"),
    ];
  }

  /**
   * Validate class data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SchoolAddClassValidator
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
export default SchoolAddClassValidator;
