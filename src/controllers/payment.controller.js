import moment from "moment";

import EnrolledCourse from "../db/models/enrolledCourses.model";
import PaymentPlan from "../db/models/paymentPlans.model";
import Transaction from "../db/models/transaction.model";

/**
 *Contains Payment Controller
 *
 *
 *
 * @class PaymentController
 */
class PaymentController {
  /**
   * Verify a Payment
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async verifyPayment(req, res) {
    /* It is a good idea to log all events received. Add code *
     * here to log the signature and body to db or file       */

    // retrieve the signature from the header
    const hash = req.headers["verif-hash"];

    if (!hash) {
      // discard the request,only a post with the right Flutterwave signature
      // header gets our attention
      return res.status(401).json({
        status: "401 wrong signature",
        error: "Hash not found",
      });
    }

    // Get signature stored as env variable on your server
    const secret_hash = process.env.MY_HASH;

    // check if signatures match

    if (hash !== secret_hash) {
      // silently exit, or check that you are passing the right hash on your server.
      return res.status(404).json({
        status: "404 hash not found",
        error: "Hash is not a match",
      });
    }

    // Retrieve the request's body
    // var request_json = JSON.parse(request.body);

    // Give value to your customer but don't give any output
    // Remember that this is a call from rave's servers and
    // Your customer is not seeing the response here at all

    // response.send(200);
    try {
      if (req.body.data.status !== "successful") {
        const ref = await Transaction.findOneAndUpdate(
          {
            tx_ref: req.body.data.tx_ref,
          },
          { status: req.body.data.status, flutterWaveResponse: req.body },
          { new: true }
        ).populate("paymentPlanId");
        return res.status(500).json({
          ref,
          status: "500 Internal server error",
          error: "Unsuccesful Payment",
        });
      }
      // check if an equivalent payment ref exists
      const ref = await Transaction.findOneAndUpdate(
        {
          tx_ref: req.body.data.tx_ref,
        },
        { status: "successful", flutterWaveResponse: req.body },
        { new: true }
      ).populate("paymentPlanId");
      if (!ref) {
        return res.status(404).json({
          status: "404 Payment Ref not found",
          error: "Error Loading Payment Ref",
        });
      }
      // update enrolled course; status, startDate and endDate
      const startdate = moment().format("DD-MM-YYYY");
      const endDate = moment(startdate, "DD-MM-YYYY")
        .add(ref.paymentPlanId.duration, "months")
        .toDate();
      const enrolledCourse = await EnrolledCourse.findOneAndUpdate(
        {
          _id: ref.enrolledCourseId,
        },
        { status: "paid", startdate, endDate },
        { new: true }
      );
      // await enrolledCourse.update({ status: "paid", startdate, endDate });

      return res.status(200).json({
        status: "success",
        enrolledCourse,
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Verifying payment",
      });
    }
  }

  /**
   * Get payment plans
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getPaymentPlans(req, res) {
    try {
      const paymentPlans = await PaymentPlan.find({}).populate("category");

      return res.status(200).json({
        status: "success",
        paymentPlans,
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading class",
      });
    }
  }
  //   }
}
export default PaymentController;
/*

 order.eta = moment(order.eta).add(req.body.eta, "days").toDate();

*/
