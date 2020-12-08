import Question from '../db/models/questions.model';
/**
 *Contains Lesson Controller
 *
 *
 *
 * @class LessonController
 */
class LessonController {
  /**
   * Get test for a lesson
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async loadTest(req, res) {
    try {
      const questions = await Question.find({ lessonId: req.params.lessonId });

      return res.status(200).json({
        status: 'success',
        data: {
          questions,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading courses',
      });
    }
  }
}
export default LessonController;
