import Subject from '../db/models/subjects.model';
/**
 *Contains Course Controller
 *
 *
 *
 * @class SubjectController
 */
class SubjectController {
  /**
   * Get all Subjects for a course
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof SubjectController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getSubjectsForACourse(req, res) {
    try {
      const subjects = await Subject.find({ courseId: req.params.courseId });

      return res.status(200).json({
        status: 'success',
        data: {
          subjects,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading subjects',
      });
    }
  }
}
export default SubjectController;
