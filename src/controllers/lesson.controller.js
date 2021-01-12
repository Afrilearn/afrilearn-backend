import Question from '../db/models/questions.model';
import QuizResult from '../db/models/quizResults.model';
import Lesson from '../db/models/lessons.model';
import SubjectProgress from '../db/models/subjectProgresses.model';
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
        error: 'Error Loading questions',
      });
    }
  }

  /**
   * Seacrch for lessons
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async searchLessons(req, res) {
    try {
      const searchEntry = req.query.searchQuery ? req.query.searchQuery : '';
      const searchQuery = new RegExp(`.*${searchEntry}.*`, 'i');
      const lessons = await Lesson.find({
        $or: [{ title: searchQuery }, { content: searchQuery }],
      });

      return res.status(200).json({
        status: 'success',
        data: {
          lessons,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading lessons',
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
        subjectId: req.body.subjectId,
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
        error: 'Error saving results',
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
        error: 'Error Loading tests',
      });
    }
  }

  /**
   * Get subject lessons and progress
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getSubjectLessonsAndProgress(req, res) {
    try {
      const { courseId, subjectId } = req.params;
      let subjectProgress = 0;

      const condition = {
        courseId,
        subjectId,
      };

      const resultCondition = {
        courseId,
      };

      const lessons = await Lesson.find(condition);

      if (req.body.userId) {
        condition.userId = req.body.userId;
        resultCondition.userId = req.body.userId;
      }

      if (req.body.classId) {
        condition.classId = req.body.classId;
        resultCondition.classId = req.body.classId;
      }

      const progress = await SubjectProgress.find(condition);

      subjectProgress = (progress.length / lessons.length) * 100;
      const results = await QuizResult.find(resultCondition);
      let totalScore = 0;
      results.forEach((result) => {
        totalScore += result.score;
      });
      const strength = totalScore / results.length;

      return res.status(200).json({
        status: 'success',
        data: {
          lessons,
          subjectProgress,
          strength,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading lessons',
      });
    }
  }
}
export default LessonController;
