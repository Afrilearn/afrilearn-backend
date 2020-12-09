import Question from '../db/models/questions.model';
import QuizResult from '../db/models/quizResults.model';
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

  /**
   * Save test result
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async saveTestResult(req, res) {
    try {
      const results = [];

      req.body.results.forEach((result) => {
        results.push({
          questionId: result.questionId,
          optionSelected: result.optionSelected,
          correctOption: result.correctOption,
          status: result.status,
        });
      });
      const quizResultData = {
        results,
        userId: req.data.id,
        classId: req.body.classId,
        courseId: req.body.courseId,
        lessonId: req.params.lessonId,
        timeSpent: req.body.timeSpent,
        numberOfCorrectAnswers: req.body.numberOfCorrectAnswers,
        numberOfWrongAnswers: req.body.numberOfWrongAnswers,
        numberOfSkippedQuestions: req.body.numberOfSkippedQuestions,
        score: req.body.score,
        remark: req.body.remark,
      };
      const quizResult = await QuizResult.create({ ...quizResultData });

      return res.status(200).json({
        status: 'success',
        data: {
          results: quizResult,
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
   * Get test result
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getTestResult(req, res) {
    try {
      let quizResult = await QuizResult.findOne({
        lessonId: req.params.lessonId,
        userId: req.data.id,
      });
      if (Object.keys(req.body).includes('classId')) {
        quizResult = await QuizResult.findOne({
          lessonId: req.params.lessonId,
          userId: req.data.id,
          classId: req.body.classId,
        });
      }
      if (!quizResult) {
        return res.status(404).json({
          status: '404 error not found',
          error: 'Result not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          results: quizResult,
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
