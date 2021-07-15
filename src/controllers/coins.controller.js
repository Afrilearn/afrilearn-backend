import User from "../db/models/users.model";
import AfriCoinTransaction from "../db/models/afriCoinTransaction.model";

/**
 *Contains Afri Coins Controller
 *
 *
 *
 * @class CoinsController
 */
class CoinsController {
  /**
   * Add or remove coins
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CoinsController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addOrRemoveCoins(req, res) {
    try {
      const transaction = await AfriCoinTransaction.create({
        ...req.body,
        userId: req.data.id,
      });
      const user = await User.findById(req.data.id);
      if (req.body.type === "add") {
        user.afriCoins += req.body.amount;
      }
      if (req.body.type === "remove") {
        user.afriCoins -= req.body.amount;
      }
      await user.save();

      return res.status(200).json({
        status: "success",
        data: {
          transaction,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Updating afri coins",
      });
    }
  }

  /**
   * Get my Coins Transactions
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CoinsController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getCoinsTransactions(req, res) {
    try {
      const transactions = await AfriCoinTransaction.find({
        userId: req.data.id,
      });

      return res.status(200).json({
        status: "success",
        data: {
          transactions,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting transactions",
      });
    }
  }
}
export default CoinsController;
