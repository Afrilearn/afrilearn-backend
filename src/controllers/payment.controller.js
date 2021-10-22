import moment from "moment";
import iap from "iap";
import EnrolledCourse from "../db/models/enrolledCourses.model";
import PaymentPlan from "../db/models/paymentPlans.model";
import AfriCoinPaymentPlan from "../db/models/afriCoinPaymentPlans.model";

import Transaction from "../db/models/transaction.model";
import Helper from "../utils/user.utils";
import ClassModel from "../db/models/classes.model";
import axios from "axios";
import { config } from "dotenv";
import AfriCoinTransaction from "../db/models/afriCoinTransaction.model";
import User from "../db/models/users.model";
import sendEmail from "../utils/email.utils";
import TeacherPaymentPlan from "../db/models/teacherPaymentPlan";

config();

class PaymentController {
  static async verifyPayment(req, res) {
    try {
      await Transaction.create({
        flutterWaveResponse: req.body,
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
        const ref = await Transaction.findOneAndUpdate(
          {
            tx_ref: req.body.data.tx_ref,
          },
          {
            status: req.body.data.status,
            flutterWaveResponse: req.body,
          },
          {
            new: true,
          }
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
        {
          status: "successful",
          flutterWaveResponse: req.body,
        },
        {
          new: true,
        }
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
        {
          status: "paid",
          startdate,
          endDate,
        },
        {
          new: true,
        }
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

  static async getTeacherPaymentPlans(req, res) {
    try {
      const paymentPlans = await TeacherPaymentPlan.find({}).populate(
        "category"
      );

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

  static async getAfriCoinPaymentPlans(req, res) {
    try {
      const paymentPlans = await AfriCoinPaymentPlan.find({});

      return res.status(200).json({
        status: "success",
        paymentPlans,
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting Payment Plans",
      });
    }
  }

  static async addAfriCoinPaymentPlan(req, res) {
    try {
      const plan = await AfriCoinPaymentPlan.create({ ...req.body });

      return res.status(200).json({
        status: "success",
        plan,
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error adding Payment Plan",
      });
    }
  }

  static async addTeacherPaymentPlan(req, res) {
    try {
      const plan = await TeacherPaymentPlan.create({ ...req.body });

      return res.status(200).json({
        status: "success",
        plan,
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error adding Payment Plan",
      });
    }
  }

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

      //send mail to user
      const userThatPaid = await User.findById(req.body.userId);
      const htmlMessage = `<html>
          <head>
            <title></title>
            <link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
          </head>
          <body>
          <div>Dear ${userThatPaid.fullName},</div>
          
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
      sendEmail(userThatPaid.email, "Afrilearn Transaction", htmlMessage);

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

  static async verifyGoogleBilingPaymentForCoinPurchase(req, res) {
    try {
      let verified = null;
      let condition = null;
      let newClass = null;
      let platform = "google";

      const { purchaseToken, productId, courseId, clientUserId } = req.body;

      const paymentPlan = await AfriCoinPaymentPlan.findById(productId);
      const { role } = req.data;
      if(req.body.platform){
        platform = req.body.platform;
      }       
    
      const payment = {
        receipt: purchaseToken,
        productId,
        packageName: "com.afrilearn",
        keyObject: require("./../../gcpconfig.json"),
      };

      iap.verifyPayment(platform, payment, function (error, response) {
        if (error) {
          return res.status(400).json({
            status: "error",
            error,
          });
        } else {
          if (platform =='apple' || (platform =='android' && response.receipt.purchaseState === 0)) {
            verified = true;

            const dataToSend = {
              verified: true,
              purchaseState: response.receipt.purchaseState,
            };
            if (paymentPlan.amount) {
              dataToSend.coinAmount = paymentPlan.amount;
            }
            if (paymentPlan.amount) {
              (async () => {
                await AfriCoinTransaction.create({
                  description: "Coins Purchase",
                  type: "add",
                  amount: paymentPlan.amount,
                  userId: clientUserId,
                });
                const userThatPaid = await User.findByIdAndUpdate(
                  clientUserId,
                  {
                    $inc: { afriCoins: paymentPlan.amount },
                  },
                  { new: true }
                );
                const htmlMessage = `<html>
                      <head>
                        <title></title>
                        <link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
                      </head>
                      <body>
                      <div>Dear ${userThatPaid.fullName},</div>
                      
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
                sendEmail(
                  userThatPaid.email,
                  "Afrilearn Transaction",
                  htmlMessage
                );
              })();
            }
            return res.status(200).json({
              status: "success",
              data: dataToSend,
            });
          } else {
            return res.status(200).json({
              status: "success",
              data: {
                verified: false,
                purchaseState: response,
                // purchaseState:response.receipt.purchaseState
              },
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

  static async payWithAfriCoins(req, res) {
    try {
      let condition = null;
      let newClass = null;
      const { purchaseToken, productId, courseId, clientUserId } = req.body;

      const { role } = req.data;

      const paymentPlan = await PaymentPlan.findOne(
        {
          _id: productId,
        },
        {
          amount: 1,
          duration: 1,
        }
      );
      const afriCoins = paymentPlan.amount;

      if (role === "602f3ce39b146b3201c2dc1d") {
        (async () => {
          if (req.body.newClassName) {
            let classCode = await Helper.generateCode(8);

            const existingClassCode = await ClassModel.findOne({
              classCode,
            });
            if (existingClassCode) {
              classCode = await Helper.generateCode(9);
            }

            condition = {
              userId: clientUserId,
              name: req.body.newClassName,
              courseId,
              classCode,
            };

            newClass = await ClassModel.create(condition);
          }

          // check whether the user is already enrolled for this course
          condition = {
            courseId,
            userId: clientUserId,
          };
          if (req.body.newClassName) {
            condition["classId"] = newClass.id;
          }
          let existingEnrolledCourse = await EnrolledCourse.findOne(condition);

          if (!existingEnrolledCourse) {
            existingEnrolledCourse = await EnrolledCourse.create(condition);
          }

          // Get payment plan length and amount
          condition = {
            _id: productId,
          };

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
            status: "successful",
            userId: clientUserId,
            enrolledCourseId: existingEnrolledCourse._id,
            paymentPlanId: productId,
          };
          await Transaction.create(condition);
        })();
      } else {
        // if is not a teacher do this
        (async () => {
          // check whether the user is already enrolled for this course
          condition = {
            courseId,
            userId: clientUserId,
          };

          let existingEnrolledCourse = await EnrolledCourse.findOne(condition);

          if (!existingEnrolledCourse) {
            if (role === "602f3ce39b146b3201c2dc1d" && req.body.newClassName) {
              //console.log("attash class id");
              //console.log(newClass);
              condition["classId"] = newClass.id;
            }
            existingEnrolledCourse = await EnrolledCourse.create(condition);
          }

          // Get payment plan length and amount
          condition = {
            _id: productId,
          };

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
            status: "successful",
            userId: clientUserId,
            enrolledCourseId: existingEnrolledCourse._id,
            paymentPlanId: productId,
          };
          await Transaction.create(condition);
        })();
      }

      const userThatPaid = await User.findById(clientUserId);
      //send email to user
      const htmlMessage = `<html>
          <head>
            <title></title>
            <link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
          </head>
          <body>
          <div>Dear ${userThatPaid.fullName},</div>
          
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
      sendEmail(userThatPaid.email, "Afrilearn Transaction", htmlMessage);
      return res.status(200).json({
        status: "success",
        data: {
          verified: true,
          afriCoins,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Paying with Coins",
      });
    }
  }

  static async verifyPaystackPayment(req, res) {
    try {
      let verified = null;
      let condition = null;
      let newClass = null;

      const {
        reference,
        productId,
        courseId,
        clientUserId,
        classId,
        subjectIds,
      } = req.body;

      const { role } = req.data;

      const response = await axios({
        method: "get",
        url: `https://api.paystack.co/transaction/verify/${reference}`,
        headers: { Authorization: process.env.PAYSTACK_SECRET_KEY },
      });
      if (response.data.status === true) {
        const userThatPaid = await User.findById(clientUserId);
        const htmlMessage = `<html>
            <head>
              <title></title>
              <link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
            </head>
            <body>
            <div>Dear ${userThatPaid.fullName},</div>
            
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
        sendEmail(userThatPaid.email, "Afrilearn Transaction", htmlMessage);

        if (response.data.data.status === "success") {
          verified = true;
          if (role === "602f3ce39b146b3201c2dc1d") {
            (async () => {
              if (req.body.newClassName) {
                let classCode = await Helper.generateCode(8);

                const existingClassCode = await ClassModel.findOne({
                  classCode,
                });
                if (existingClassCode) {
                  classCode = await Helper.generateCode(9);
                }

                condition = {
                  userId: clientUserId,
                  name: req.body.newClassName,
                  courseId,
                  classCode,
                };
                if (subjectIds) {
                  condition.subjectIds = subjectIds.map((i) => {
                    return {
                      subjectId: i,
                    };
                  });
                }

                newClass = await ClassModel.create(condition);
              }

              // check whether the user is already enrolled for this course
              condition = {
                courseId,
                userId: clientUserId,
              };
              if (req.body.newClassName) {
                condition["classId"] = newClass.id;
              }
              let existingEnrolledCourse = await EnrolledCourse.findOne(
                condition
              );

              if (!existingEnrolledCourse) {
                existingEnrolledCourse = await EnrolledCourse.create(condition);
              }

              // Get payment plan length and amount
              condition = {
                _id: productId,
              };
              const paymentPlan = await TeacherPaymentPlan.findOne(
                {
                  _id: productId,
                },
                {
                  amount: 1,
                  duration: 1,
                }
              );
              // console.log("paymentPlan", paymentPlan);

              //credit the user
              const startdate = moment().toDate();
              const endDate = moment(startdate, "DD-MM-YYYY")
                .add(paymentPlan.duration, "months")
                .toDate();

              existingEnrolledCourse.startDate = startdate;
              existingEnrolledCourse.endDate = endDate;
              existingEnrolledCourse.status = "paid";
              existingEnrolledCourse.save();

              if (classId) {
                const classBeingPaidFor = await ClassModel.findById(classId);

                if (classBeingPaidFor.subjectIds.length > 0) {
                  if (subjectIds) {
                    for (let index = 0; index < subjectIds.length; index++) {
                      const subjectIdItem = subjectIds[index];
                      if (
                        classBeingPaidFor.subjectIds.find(
                          (i) => i.subjectId == subjectIdItem
                        )
                      ) {
                        classBeingPaidFor.subjectIds[index] = {
                          ...classBeingPaidFor.subjectIds[index],
                          startdate,
                          endDate,
                        };
                      } else {
                        classBeingPaidFor.subjectIds.push({
                          subjectId: subjectIdItem,
                          startdate,
                          endDate,
                        });
                      }
                    }
                  } else if (req.body.subjectId) {
                    const alreadyIn = classBeingPaidFor.subjectIds.findIndex(
                      (i) => i.subjectId == req.body.subjectId
                    );
                    if (alreadyIn === -1) {
                      classBeingPaidFor.subjectIds = [
                        ...classBeingPaidFor.subjectIds,
                        {
                          subjectId: req.body.subjectId,
                          startdate,
                          endDate,
                        },
                      ];
                    } else {
                      const cloneSubjects = classBeingPaidFor.subjectIds;
                      cloneSubjects.splice(alreadyIn, 1, {
                        subjectId: req.body.subjectId,
                        startdate,
                        endDate,
                      });
                      classBeingPaidFor.subjectIds = cloneSubjects;
                    }
                  }
                } else {
                  if (subjectIds) {
                    classBeingPaidFor.subjectIds = subjectIds.map((i) => {
                      return {
                        subjectId: i,
                        startdate,
                        endDate,
                      };
                    });
                  } else if (req.body.subjectId) {
                    classBeingPaidFor.subjectIds = [
                      {
                        subjectId: req.body.subjectId,
                        startdate,
                        endDate,
                      },
                    ];
                  }
                }
                await classBeingPaidFor.save();
              }

              // // Create the transaction
              condition = {
                tx_ref: reference,
                amount: paymentPlan.amount,
                status: "successful",
                userId: clientUserId,
                enrolledCourseId: existingEnrolledCourse._id,
                paymentPlanId: productId,
              };
              await Transaction.create(condition);
            })();
          } else {
            // if is not a teacher do this
            (async () => {
              // check whether the user is already enrolled for this course
              condition = {
                courseId,
                userId: clientUserId,
              };

              let existingEnrolledCourse = await EnrolledCourse.findOne(
                condition
              );

              if (!existingEnrolledCourse) {
                existingEnrolledCourse = await EnrolledCourse.create(condition);
              }

              // Get payment plan length and amount
              condition = {
                _id: productId,
              };
              const paymentPlan = await PaymentPlan.findOne(
                {
                  _id: productId,
                },
                {
                  amount: 1,
                  duration: 1,
                }
              );

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
                status: "successful",
                userId: clientUserId,
                enrolledCourseId: existingEnrolledCourse._id,
                paymentPlanId: productId,
              };
              await Transaction.create(condition);
            })();
          }
          return res.status(200).json({
            status: "success",
            data: {
              verified: true,
            },
          });
        } else {
          return res.status(200).json({
            status: "success",
            data: {
              verified: false,
            },
          });
        }
      } else {
        return res.status(200).json({
          status: "success",
          data: {
            verified: false,
          },
        });
      }
      return res.status(200).json({
        status: "success1",
      });
    } catch (error) {
      //console.log(error.response.data);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Verifying paystack payment",
      });
    }
  }

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

  static async verifyGoogleBilingPayment(req, res) {
    try {
      let verified = null;
      let condition = null;
      let newClass = null;
      let platform = "google";

      const { purchaseToken, productId, courseId, clientUserId, classId } =
        req.body;

      const { role } = req.data;

      if(req.body.platform){
        platform = req.body.platform;
      }       
      const payment = {
        receipt: purchaseToken,
        productId,
        packageName: "com.afrilearn",
        keyObject: require("./../../gcpconfig.json"),
      };

      iap.verifyPayment(platform, payment, function (error, response) {
        if (error) {          
          return res.status(400).json({
            status: "error",
            error,
          });
        } else {         
          if (platform =='apple' || (platform =='android' && response.receipt.purchaseState === 0)) {
            verified = true;
            if (role === "602f3ce39b146b3201c2dc1d") {
              (async () => {
                if (req.body.newClassName) {
                  let classCode = await Helper.generateCode(8);

                  const existingClassCode = await ClassModel.findOne({
                    classCode,
                  });
                  if (existingClassCode) {
                    classCode = await Helper.generateCode(9);
                  }

                  condition = {
                    userId: clientUserId,
                    name: req.body.newClassName,
                    courseId,
                    classCode,
                  };
                  if (req.body.subjectId) {
                    condition.subjectIds = [{ subjectId: req.body.subjectId }];
                  }
                  newClass = await ClassModel.create(condition);
                  //console.log(newClass);
                }

                // check whether the user is already enrolled for this course
                condition = {
                  courseId,
                  userId: clientUserId,
                };
                if (req.body.newClassName) {
                  condition["classId"] = newClass.id;
                }
                let existingEnrolledCourse = await EnrolledCourse.findOne(
                  condition
                );

                if (!existingEnrolledCourse) {
                  // if (role === '602f3ce39b146b3201c2dc1d' && req.body.newClassName) {
                  //   //console.log('attash class id')
                  //   //console.log(newClass)
                  //   condition['classId'] = newClass.id;
                  // }
                  existingEnrolledCourse = await EnrolledCourse.create(
                    condition
                  );
                }

                // Get payment plan length and amount
                condition = {
                  _id: productId,
                };
                const paymentPlan = await TeacherPaymentPlan.findOne(
                  { _id: productId },
                  {
                    amount: 1,
                    duration: 1,
                  }
                );
                console.log("paymentPlan", paymentPlan);

                //credit the user
                const startdate = moment().toDate();
                const endDate = moment(startdate, "DD-MM-YYYY")
                  .add(paymentPlan.duration, "months")
                  .toDate();

                existingEnrolledCourse.startDate = startdate;
                existingEnrolledCourse.endDate = endDate;
                existingEnrolledCourse.status = "paid";
                existingEnrolledCourse.save();

                //Assume the user has only one subject in class
                if (classId) {
                  const classBeingPaidFor = await ClassModel.findById(classId);
                  if (classBeingPaidFor.subjectIds.length > 0) {
                    classBeingPaidFor.subjectIds[0] = {
                      ...classBeingPaidFor.subjectIds[0],
                      startdate,
                      endDate,
                    };
                  } else {
                    classBeingPaidFor.subjectIds = [
                      {
                        subjectId: req.body.subjectId,
                        startdate,
                        endDate,
                      },
                    ];
                  }
                  await classBeingPaidFor.save();
                }
                // // Create the transaction
                condition = {
                  tx_ref: purchaseToken,
                  amount: paymentPlan.amount,
                  status: "successful",
                  userId: clientUserId,
                  enrolledCourseId: existingEnrolledCourse._id,
                  paymentPlanId: productId,
                };
                await Transaction.create(condition);
              })();
            } else {
              // if is not a teacher do this
              (async () => {
                // check whether the user is already enrolled for this course
                condition = {
                  courseId,
                  userId: clientUserId,
                };

                let existingEnrolledCourse = await EnrolledCourse.findOne(
                  condition
                );

                if (!existingEnrolledCourse) {
                  if (
                    role === "602f3ce39b146b3201c2dc1d" &&
                    req.body.newClassName
                  ) {                  
                    condition["classId"] = newClass.id;
                  }
                  existingEnrolledCourse = await EnrolledCourse.create(
                    condition
                  );
                }

                // Get payment plan length and amount
                condition = {
                  _id: productId,
                };
                const paymentPlan = await PaymentPlan.findOne(
                  {
                    _id: productId,
                  },
                  {
                    amount: 1,
                    duration: 1,
                  }
                );

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
                  status: "successful",
                  userId: clientUserId,
                  enrolledCourseId: existingEnrolledCourse._id,
                  paymentPlanId: productId,
                };
                await Transaction.create(condition);
              })();
            }

            const dataToSend = {
              verified: true,
              purchaseState: response.receipt.purchaseState,
            };

            return res.status(200).json({
              status: "success",
              data: dataToSend,
            });
          } else {
            return res.status(200).json({
              status: "success",
              data: {
                verified: false,
                purchaseState: response,
                // purchaseState:response.receipt.purchaseState
              },
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
}

export default PaymentController;
