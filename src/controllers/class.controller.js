import ClassModel from '../db/models/classes.model';
import ClassMember from '../db/models/classMembers.model';
import Helper from '../utils/user.utils';
/**
 *Contains Class Controller
 *
 *
 *
 * @class ClassController
 */
class ClassController {
  /**
   * Add a Class
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
        userId: req.data.id,
        name: req.body.name,
      };
      const newClass = await ClassModel.create({ ...classData });

      return res.status(200).json({
        status: 'success',
        data: {
          class: newClass,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading class',
      });
    }
  }

  /**
   * Student send a Class request
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async sendClassRequest(req, res) {
    try {
      const classMemberData = {
        classId: req.body.classId,
        userId: req.data.id,
      };
      const newClassMember = await ClassMember.create({ ...classMemberData });

      return res.status(200).json({
        status: 'success',
        data: {
          message:
            'Your class request was sent, wait for teacher to let you in',
          classMember: newClassMember,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading class',
      });
    }
  }

  /**
   * Teacher accept/reject/retract a Class request
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async acceptRejectRetractClassRequest(req, res) {
    try {
      const classMemberData = {
        classId: req.body.classId,
        userId: req.body.userId,
      };
      const newClassMember = await ClassMember.findOneAndUpdate(
        { ...classMemberData },
        { status: req.body.status },
      );

      return res.status(200).json({
        status: 'success',
        data: {
          classMember: newClassMember,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading class',
      });
    }
  }

  /**
   * Get list of students in a class
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getStudentsInClass(req, res) {
    try {
      const classMembers = await ClassMember.find({
        classId: req.params.classId,
      })
        .select('userId -_id')
        .populate('userId', 'fullName');

      return res.status(200).json({
        status: 'success',
        data: {
          classMembers,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading class',
      });
    }
  }
}
export default ClassController;
