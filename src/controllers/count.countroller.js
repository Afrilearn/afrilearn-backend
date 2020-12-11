import Lesson from '../db/models/lessons.model';
import Question from '../db/models/questions.model';
/**
 *Contains Class Controller
 *
 *
 *
 * @class CountController
 */
class CountController {
  /**
   * Add a Class
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CountController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getAllCounts(req, res) {
    try {
      const videoLessonsCount = await Lesson.countDocuments({});
      const questionsCount = await Question.countDocuments({});

      return res.status(200).json({
        status: 'success',
        data: {
          questionsCount,
          videoLessonsCount,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading counts',
      });
    }
  }
}
export default CountController;
