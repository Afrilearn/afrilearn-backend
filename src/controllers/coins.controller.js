import User from "../db/models/users.model";
import AfriCoinTransaction from "../db/models/afriCoinTransaction.model";
import ChallengeUtility from "../services/challenge.services";
import sendEmail from "../utils/email.utils";

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
      if (req.body.type === "add") {
        //send email to user
        const htmlMessage = `<html>
          <head>
            <title></title>
            <link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
          </head>
          <body>
          <div>Dear ${user.fullName},</div>
          
          <div>&nbsp;</div>
          
          <div>&nbsp;</div>
          
          <div>Congrats on subscribing to the best-kept secret of Successful Students; we’re super excited to have you as part of the winning Afrilearn family!</div>
          <div>&nbsp;</div>
          <div>To get started on your personalized fun learning portal, simply log on to your dashboard. You can access Afrilearn on your Smartphone, Tablet, or PC.</div>
          <div>&nbsp;</div>
          <div>Feel free to let us know if you have any questions by replying to this email.</div>
          <div>&nbsp;</div>  
          <div>Your dreams are valid and we’re rooting for you!</div>
          
          <div>&nbsp;</div>
          
          <div>&nbsp;</div>
          
          <div>All the best,</div>
          <div>&nbsp;</div>
          <div>Team Afrilearn</div>
          
          </body>
          </html>
      `;
        sendEmail(user.email, "Afrilearn Transaction", htmlMessage);
      }
      return res.status(200).json({
        status: "success",
        data: {
          transaction,
          afriCoins: user.afriCoins,
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
