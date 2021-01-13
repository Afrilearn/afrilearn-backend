import moment from 'moment';

import EnrolledCourse from '../db/models/enrolledCourses.model';
import PaymentPlan from '../db/models/paymentPlans.model';
import Transaction from '../db/models/transaction.model';

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
    try {
      if (req.body.data.status !== 'successful') {
        return res.status(500).json({
          status: '500 Internal server error',
          error: 'Unsuccesful Payment',
        });
      }
      // check if an equivalent payment ref exists
      const ref = await Transaction.findOne({
        tx_ref: req.body.data.tx_ref,
      }).populate({ path: 'paymentPlanId', model: PaymentPlan });
      if (!ref) {
        return res.status(404).json({
          status: '404 Payment Ref not found',
          error: 'Error Loading Payment Ref',
        });
      }

      // update enrolled course; status, startDate and endDate
      const startdate = moment().format('DD-MM-YYYY');
      const endDate = moment(startdate, 'DD-MM-YYYY')
        .add(ref.paymentPlanId.duration, 'months')
        .toDate();

      const enrolledCourse = await EnrolledCourse.findOne({
        _id: ref.enrolledCourseId,
      });
      await enrolledCourse.update({ status: 'paid', startdate, endDate });

      return res.status(200).json({
        status: 'success',
        enrolledCourse,
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading class',
      });
    }
  }
  //   }
}
export default PaymentController;
/*

 order.eta = moment(order.eta).add(req.body.eta, "days").toDate();

*/
