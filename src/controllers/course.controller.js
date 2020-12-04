import Course from '../db/models/courses.model';
/**
 *Contains Course Controller
 *
 *
 *
 * @class CourseController
 */
class CourseController {
  /**
   * Get all Cousres
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CourseController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async loadCourses(req, res) {
    try {
      const courses = await Course.find({});

      return res.status(200).json({
        status: 'success',
        data: {
          courses,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading courses',
      });
    }
  }

  /**
   * Get a Cousre
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CourseController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getCourse(req, res) {
    try {
      const course = await Course.findById(req.params.courseId);
      return res.status(200).json({
        status: 'success',
        data: {
          course,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading course',
      });
    }
  }
}
export default CourseController;
