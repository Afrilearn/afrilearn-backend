import ClassModel from "../db/models/classes.model";
import Helper from "../utils/user.utils";
/**
 *Contains Class Controller
 *
 *
 *
 * @class ClassController
 */
class ClassController {
  /**
   * Get all Cousres
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addClass(req, res) {
    let classCode = await Helper.generateCode(8);
    try {
      const existingClassCode = await ClassModel.findOne({ classCode });

      if (existingClassCode) {
        classCode = await Helper.generateCode(8);
      }
      const classData = {
        courseId: req.body.courseId,
        userId: req.body.userId,
        name: req.body.name,
        classCode,
      };
      const newClass = await ClassModel.create({ ...classData });

      return res.status(200).json({
        status: "success",
        data: {
          class: newClass,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading class",
      });
    }
  }
}
export default ClassController;
