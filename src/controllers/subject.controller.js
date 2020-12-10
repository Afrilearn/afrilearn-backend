import Course from '../db/models/courses.model';
import Subject from '../db/models/subjects.model';
/**
 *Contains Subject Controller
 *
 *
 *
 * @class SubjectController
 */
class SubjectController {
  /**
   * Add a Subject test
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof SubjectController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addSubject(req, res) {
    try {
      const subject = await Subject.create({ ...req.body });
      await Course.findOneAndUpdate(
        { _id: req.body.courseId },
        { $inc: { subjects: 1 } },
      );

      return res.status(200).json({
        status: 'success',
        data: {
          subject,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Saving Subject',
      });
    }
  }
}
export default SubjectController;
