import AdminRole from "../db/models/adminRole.model";
import ClassModel from "../db/models/classes.model";

/**
 *Contains AdminRole Controller
 *
 *
 *
 * @class AdminRoleController
 */
class AdminRoleController {
  /**
   * Add an Admin to a class
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AdminRoleController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addAdminToClass(req, res) {
    try {
      const existingClass = await ClassModel.findOne({ _id: req.body.classId });

      if (!existingClass) {
        return res.status(404).json({
          status: "404 Not found",
          error: "The class you selected is not found",
        });
      }

      const admin = await AdminRole.create({
        userId: req.body.userId,
        classId: req.body.classId,
      });

      return res.status(200).json({
        status: "success",
        data: {
          admin,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding admin",
      });
    }
  }
}
export default AdminRoleController;
