import PastQuestionProgress from '../db/models/pastQuestionProgresses.model';
import PastQuestionQuizResult from '../db/models/pastQuestionQuizResults.model';
/**
 *Contains pastQuestion Controller
 *
 *
 *
 * @class PastQuestionController
 */
class PastQuestionController {
  /**
   * Add a pastQuestionProgress
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof PastQuestionController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addPastQuestionProgress(req, res) {
    try {
      const pastQuestionProgress = await PastQuestionProgress.create({
        userId: req.data.id,
        ...req.body,
      });
      return res.status(201).json({
        status: 'success',
        data: { pastQuestionProgress },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Adding progress',
      });
    }
  }

  /**
   * Save past question result
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof PastQuestionController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async savePastQuestionResult(req, res) {
    try {
      const results = [];

      req.body.results.forEach((result) => {
        results.push({
          questionId: result.question_id,
          optionSelected: result.optionSelected,
          correctOption: result.correctOption,
          status: result.status,
        });
      });
      const pastQuestionResultData = {
        results,
        userId: req.data.id,
        classId: req.body.classId,
        courseId: req.body.courseId,
        subjectId: req.params.subjectId,
        subjectCategoryId: req.body.subjectCategoryId,
        subjectName: req.body.subjectName,
        pastQuestionCategoryId: req.body.pastQuestionCategoryId,
        pastQuestionTypeId: req.body.pastQuestionTypeId,
        timeSpent: req.body.timeSpent,
        numberOfCorrectAnswers: req.body.numberOfCorrectAnswers,
        numberOfWrongAnswers: req.body.numberOfWrongAnswers,
        numberOfSkippedQuestions: req.body.numberOfSkippedQuestions,
        score: req.body.score,
        remark: req.body.remark,
      };
      const pastQuestionResult = await PastQuestionQuizResult.create({
        ...pastQuestionResultData,
      });

      return res.status(201).json({
        status: 'success',
        data: {
          results: pastQuestionResult,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error saving results',
      });
    }
  }
}
export default PastQuestionController;
