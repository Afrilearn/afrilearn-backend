import { check, validationResult } from "express-validator";
import AuthServices from "../../services/auth.services";

/**
 *Contains add User Validator
 *
 *
 *
 * @class AddUserAsChild
 */
class AddUserAsChild {
  /**
   * validate user data.
   * @memberof AddUserAsChild
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
      check("parentId")
        .exists()
        .withMessage("Parent ID is required")
        .not()
        .isEmpty()
        .withMessage("Parent ID cannot be empty")
        .isMongoId()
        .withMessage("Parent ID should be a Mongo ID"),
    ];
  }

  /**
   * Validate add user data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof AddUserAsChild
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

  /**
   * Check whether email already exist.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof AddUserAsChild
   * @returns {JSON} - A JSON response.
   */
  static async emailAlreadyExist(req, res, next) {
    const { email } = req.body;
    const user = await AuthServices.emailExist(email, res);
    if (user) {
      return res.status(409).json({
        status: "409 Conflict",
        error: "Email address already exists",
      });
    }
    return next();
  }
}
export default AddUserAsChild;
