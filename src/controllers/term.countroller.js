import Term from '../db/models/terms.model';
/**
 *Contains Term Controller
 *
 *
 *
 * @class TermController
 */
class TermController {
  /**
   * Get all terms
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof TermController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getAllTerms(req, res) {
    try {
      const terms = await Term.find({});
      return res.status(200).json({
        status: 'success',
        data: {
          terms,
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
export default TermController;
