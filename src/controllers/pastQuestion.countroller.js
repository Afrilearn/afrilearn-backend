import PastQuestionProgress from '../db/models/pastQuestionProgresses.model';
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
}
export default PastQuestionController;
