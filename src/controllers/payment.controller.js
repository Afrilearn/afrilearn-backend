import moment from "moment";
import iap from "iap";
import EnrolledCourse from "../db/models/enrolledCourses.model";
import PaymentPlan from "../db/models/paymentPlans.model";
import Transaction from "../db/models/transaction.model";
import Helper from "../utils/user.utils";
import ClassModel from "../db/models/classes.model";
import axios from 'axios';
import { config } from 'dotenv';
config();
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
      await Transaction.create({
        flutterWaveResponse: req.body
      });
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
      // try {
      if (req.body.data.status !== "successful") {
        const ref = await Transaction.findOneAndUpdate({
          tx_ref: req.body.data.tx_ref,
        }, {
          status: req.body.data.status,
          flutterWaveResponse: req.body
        }, {
          new: true
        }).populate("paymentPlanId");
        return res.status(500).json({
          ref,
          status: "500 Internal server error",
          error: "Unsuccesful Payment",
        });
      }
      // check if an equivalent payment ref exists
      const ref = await Transaction.findOneAndUpdate({
        tx_ref: req.body.data.tx_ref,
      }, {
        status: "successful",
        flutterWaveResponse: req.body
      }, {
        new: true
      }).populate("paymentPlanId");
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
      const enrolledCourse = await EnrolledCourse.findOneAndUpdate({
        _id: ref.enrolledCourseId,
      }, {
        status: "paid",
        startdate,
        endDate
      }, {
        new: true
      });
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

  /**
   * Add transaction
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addTransaction(req, res) {
    try {
      if (req.body.courseId) {
        const existingEnrolledCourse = await EnrolledCourse.findOne({
          courseId: req.body.courseId,
          userId: req.body.userId,
        });
        if (!existingEnrolledCourse) {
          const enrolledCourse = await EnrolledCourse.create({
            userId: req.body.userId,
            courseId: req.body.courseId,
          });
          const transaction = await Transaction.create({
            ...req.body,
            enrolledCourseId: enrolledCourse._id,
          });
          const paymentPlan = await PaymentPlan.findOne({
            _id: transaction.paymentPlanId,
          });
          const startdate = moment().toDate();
          const endDate = moment(startdate, "DD-MM-YYYY")
            .add(paymentPlan.duration, "months")
            .toDate();
          existingEnrolledCourse.status = "paid";
          existingEnrolledCourse.startDate = startdate;
          existingEnrolledCourse.markModified("startDate");
          existingEnrolledCourse.endDate = endDate;
          existingEnrolledCourse.markModified("endDate");
          enrolledCourse.save();
          return res.status(201).json({
            status: "success",
            transaction, /// ////////////////////
          });
        }
        const newTransaction = await Transaction.create({
          ...req.body,
          enrolledCourseId: existingEnrolledCourse._id,
        });
        const newPaymentPlan = await PaymentPlan.findOne({
          _id: newTransaction.paymentPlanId,
        });
        const startDate = moment().toDate();
        const endDate = moment(startDate, "DD-MM-YYYY")
          .add(newPaymentPlan.duration, "months")
          .toDate();
        existingEnrolledCourse.status = "paid";

        existingEnrolledCourse.startDate = startDate;
        existingEnrolledCourse.markModified("startDate");
        existingEnrolledCourse.endDate = endDate;
        existingEnrolledCourse.markModified("endDate");
        existingEnrolledCourse.save();

        return res.status(201).json({
          status: "success",
          transaction: newTransaction, /// ////////////////////
        });
      }
      const transaction = await Transaction.create(req.body);

      return res.status(201).json({
        status: "success",
        transaction,
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error saving transaction",
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
  static async verifyGoogleBilingPayment(req, res) {
    try {
      let verified = null;
      let condition = null;
      let newClass = null;

      const {
        purchaseToken,
        productId,
        courseId,
        clientUserId
      } = req.body;

      const {
        role
      } = req.data;

      const platform = 'google';
      const payment = {
        receipt: purchaseToken,
        productId,
        packageName: 'com.afrilearn',
        // secret: 'password',
        // subscription: true,	// optional, if google play subscription
        keyObject: require('../googleplay-keystore.json'), // required, if google    
      };

      iap.verifyPayment(platform, payment, function (error, response) {
        if (error) {
          console.log(error)
          return res.status(400).json({
            status: "error",
            error
          });
        } else {
          // console.log(response)
          if (response.receipt.purchaseState === 0) {
            verified = true
            if (role === '602f3ce39b146b3201c2dc1d') {
              (async () => {
                if (req.body.newClassName) {
                  let classCode = await Helper.generateCode(8);

                  const existingClassCode = await ClassModel.findOne({
                    classCode
                  });
                  if (existingClassCode) {
                    classCode = await Helper.generateCode(9);
                  }

                  condition = {
                    userId: clientUserId,
                    name: req.body.newClassName,
                    courseId,
                    classCode
                  }

                  newClass = await ClassModel.create(condition);
                  console.log(newClass)
                }

                // check whether the user is already enrolled for this course
                condition = {
                  courseId,
                  userId: clientUserId,
                }
                if (req.body.newClassName) {
                  condition['classId'] = newClass.id
                }
                let existingEnrolledCourse = await EnrolledCourse.findOne(condition);

                if (!existingEnrolledCourse) {
                  // if (role === '602f3ce39b146b3201c2dc1d' && req.body.newClassName) {
                  //   console.log('attash class id')
                  //   console.log(newClass)
                  //   condition['classId'] = newClass.id;
                  // }
                  existingEnrolledCourse = await EnrolledCourse.create(condition);
                }

                // Get payment plan length and amount
                condition = {
                  _id: productId,
                }
                const paymentPlan = await PaymentPlan.findOne({
                  _id: productId,
                }, {
                  amount: 1,
                  duration: 1
                });

                //credit the user
                const startdate = moment().toDate();
                const endDate = moment(startdate, "DD-MM-YYYY")
                  .add(paymentPlan.duration, "months")
                  .toDate();

                existingEnrolledCourse.startDate = startdate;
                existingEnrolledCourse.endDate = endDate;
                existingEnrolledCourse.status = "paid";
                existingEnrolledCourse.save();

                // // Create the transaction
                condition = {
                  tx_ref: purchaseToken,
                  amount: paymentPlan.amount,
                  status: 'successful',
                  userId: clientUserId,
                  enrolledCourseId: existingEnrolledCourse._id,
                  paymentPlanId: productId
                }
                await Transaction.create(condition)
              })()

            } else {
              // if is not a teacher do this
              (async () => {
                // check whether the user is already enrolled for this course
                condition = {
                  courseId,
                  userId: clientUserId,
                }

                let existingEnrolledCourse = await EnrolledCourse.findOne(condition);

                if (!existingEnrolledCourse) {
                  if (role === '602f3ce39b146b3201c2dc1d' && req.body.newClassName) {
                    console.log('attash class id')
                    console.log(newClass)
                    condition['classId'] = newClass.id;
                  }
                  existingEnrolledCourse = await EnrolledCourse.create(condition);
                }

                // Get payment plan length and amount
                condition = {
                  _id: productId,
                }
                const paymentPlan = await PaymentPlan.findOne({
                  _id: productId,
                }, {
                  amount: 1,
                  duration: 1
                });

                //credit the user
                const startdate = moment().toDate();
                const endDate = moment(startdate, "DD-MM-YYYY")
                  .add(paymentPlan.duration, "months")
                  .toDate();

                existingEnrolledCourse.startDate = startdate;
                existingEnrolledCourse.endDate = endDate;
                existingEnrolledCourse.status = "paid";
                existingEnrolledCourse.save();

                // // Create the transaction
                condition = {
                  tx_ref: purchaseToken,
                  amount: paymentPlan.amount,
                  status: 'successful',
                  userId: clientUserId,
                  enrolledCourseId: existingEnrolledCourse._id,
                  paymentPlanId: productId
                }
                await Transaction.create(condition)
              })()

            }
            return res.status(200).json({
              status: "success",
              data: {
                verified: true,
                purchaseState: response.receipt.purchaseState
              }
            });
          } else {
            return res.status(200).json({
              status: "success",
              data: {
                verified: false,
                purchaseState: response
                // purchaseState:response.receipt.purchaseState
              }
            });
          }
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Verifying payment",
      });
    }
  }

  /**
   * Verify a Paystack Payment
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   *
   */
   static async verifyPaystackPayment(req, res) {
    try {
      let verified = null;
      let condition = null;
      let newClass = null;

      const {
        reference,
        productId,
        courseId,
        clientUserId
      } = req.body;      
    
      const {
        role
      } = req.data;
           
      const response = await axios({
        method: "get",
        url: `https://api.paystack.co/transaction/verify/${reference}`,
        headers: { Authorization:process.env.PAYSTACK_SECRET_KEY}      
      });      
     
      if(response.data.status === true){
        if(response.data.data.status === 'success'){
          verified = true
          if (role === '602f3ce39b146b3201c2dc1d') {
            (async () => {
              if (req.body.newClassName) {
                let classCode = await Helper.generateCode(8);

                const existingClassCode = await ClassModel.findOne({
                  classCode
                });
                if (existingClassCode) {
                  classCode = await Helper.generateCode(9);
                }

                condition = {
                  userId: clientUserId,
                  name: req.body.newClassName,
                  courseId,
                  classCode
                }

                newClass = await ClassModel.create(condition);
                console.log(newClass)
              }

              // check whether the user is already enrolled for this course
              condition = {
                courseId,
                userId: clientUserId,
              }
              if (req.body.newClassName) {
                condition['classId'] = newClass.id
              }
              let existingEnrolledCourse = await EnrolledCourse.findOne(condition);

              if (!existingEnrolledCourse) {             
                existingEnrolledCourse = await EnrolledCourse.create(condition);
              }

              // Get payment plan length and amount
              condition = {
                _id: productId,
              }
              const paymentPlan = await PaymentPlan.findOne({
                _id: productId,
              }, {
                amount: 1,
                duration: 1
              });

              //credit the user
              const startdate = moment().toDate();
              const endDate = moment(startdate, "DD-MM-YYYY")
                .add(paymentPlan.duration, "months")
                .toDate();

              existingEnrolledCourse.startDate = startdate;
              existingEnrolledCourse.endDate = endDate;
              existingEnrolledCourse.status = "paid";
              existingEnrolledCourse.save();

              // // Create the transaction
              condition = {
                tx_ref: reference,
                amount: paymentPlan.amount,
                status: 'successful',
                userId: clientUserId,
                enrolledCourseId: existingEnrolledCourse._id,
                paymentPlanId: productId
              }
              await Transaction.create(condition)
            })()

          } else {
            // if is not a teacher do this
            (async () => {
              // check whether the user is already enrolled for this course
              condition = {
                courseId,
                userId: clientUserId,
              }

              let existingEnrolledCourse = await EnrolledCourse.findOne(condition);

              if (!existingEnrolledCourse) {               
                existingEnrolledCourse = await EnrolledCourse.create(condition);
              }

              // Get payment plan length and amount
              condition = {
                _id: productId,
              }
              const paymentPlan = await PaymentPlan.findOne({
                _id: productId,
              }, {
                amount: 1,
                duration: 1
              });

              //credit the user
              const startdate = moment().toDate();
              const endDate = moment(startdate, "DD-MM-YYYY")
                .add(paymentPlan.duration, "months")
                .toDate();

              existingEnrolledCourse.startDate = startdate;
              existingEnrolledCourse.endDate = endDate;
              existingEnrolledCourse.status = "paid";
              existingEnrolledCourse.save();

              // // Create the transaction
              condition = {
                tx_ref: reference,
                amount: paymentPlan.amount,
                status: 'successful',
                userId: clientUserId,
                enrolledCourseId: existingEnrolledCourse._id,
                paymentPlanId: productId
              }
              await Transaction.create(condition)
            })()

          }
          return res.status(200).json({
            status: "success",
            data: {
              verified: true              
            }
          });
        }else{
          return res.status(200).json({
            status: "success",
            data: {
              verified: false            
            }
          });
        }        
      }else{
        return res.status(200).json({
          status: "success",
          data: {
            verified: false            
          }
        });
      }
      return res.status(200).json({
        status: "success1"
      });
    } catch (error) {
      console.log(error.response.data)
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Verifying paystack payment",
      });
    }
  }


  /**
   * Student transaction
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async studentTransaction(req, res) {
    try {


      return true;
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Verifying payment",
      });
    }
  }



}
export default PaymentController;