import Auth from "../db/models/users.model";
import Helper from "../utils/user.utils";
import sendEmail from "../utils/email.utils";
import AuthServices from "../services/auth.services";
import ResetPassword from "../db/models/resetPassword.model";
import Role from "../db/models/roles.model";
import Course from "../db/models/courses.model";
import ClassModel from "../db/models/classes.model";
import EnrolledCourse from "../db/models/enrolledCourses.model";
import ClassMember from "../db/models/classMembers.model";
import Lesson from "../db/models/lessons.model";
import Question from "../db/models/questions.model";
import mongoose from "mongoose";
import School from "../db/models/schoolProfile";

import Userz from "../../users.json";
import Students from "../../students.json";
import NewUsers from "../../NewUsers.json";
import OldUsers from "../../old.json";
import _7_8_2021 from "../../_7_8_2021.json";
import axios from "axios";
import CourseCategory from "../db/models/courseCategories.model";
import Class from "../db/models/classes.model";
import AdminRole from "../db/models/adminRole.model";
import AfriCoinTransaction from "../db/models/afriCoinTransaction.model";
import Transaction from "../db/models/transaction.model";

/**
 *Contains Auth Controller
 *
 *
 *
 * @class AuthController
 */
class AuthController {
  /**
   * Create account for a user.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async signUp(req, res) {
    try {
      let customerRole = "Student";
      const { fullName, password, email, role, phoneNumber } = req.body;

      const encryptpassword = await Helper.encrptPassword(password);

      const newUser = {
        fullName,
        password: encryptpassword,
        email,
        role,
        phoneNumber,
      };
      if (req.body.channel) {
        newUser["channel"] = req.body.channel;
      }

      if (req.body.referralCode) {
        let referee;
        if (mongoose.isValidObjectId(req.body.referralCode)) {
          newUser.referee = req.body.referralCode;
          referee = await Auth.findById(req.body.referralCode);
        } else {
          referee = await Auth.findOne({
            alternateReferralCode: req.body.referralCode,
          });
          newUser.referee = referee.id;
        }

        //add afriCoins for referee
        if (referee) {
          referee.afriCoins += 100;
          await referee.save();
          const data1 = {
            description: "Referrals",
            type: "add",
            amount: 100,
            free: true,
          };
          if (mongoose.isValidObjectId(req.body.referralCode)) {
            data1["userId"] = req.body.referralCode;
          } else {
            data1["userId"] = referee.id;
          }
          await AfriCoinTransaction.create(data1);
          //send message to the referre
          const confirmationTitle = `${referee.fullName}, ₦100 has been added to your Afrilearn Wallet!`;
          const confirmationMessage = `Hello, ${referee.fullName},<br/><br/>Congratulations, your wallet has been credited successfully with 100 Africoins.<br/><br/>
          ${newUser.fullName} has successfully registered with your referral link.<br/><br/>
          To continue having unhindered access to all Afrilearn's features, keep sharing your referral links with friends to win more coins.<br/><br/>
          Cheers,<br/><br/>
          The Afrilearn Team`;
          sendEmail(referee.email, confirmationTitle, confirmationMessage);
        }
      }

      if (req.body.referralLink) {
        newUser.referralLink = req.body.referralLink;
      }

      const result = await Auth.create({
        ...newUser,
      });

      let enrolledCourse;
      if (
        role !== "606ed82e70f40e18e029165e" &&
        role !== "607ededa2712163504210684"
      ) {
        enrolledCourse = await EnrolledCourse.create({
          userId: result._id,
          courseId: req.body.courseId,
        });
      }

      //if school role, create school profile
      if (role === "607ededa2712163504210684") {
        const school = await School.create({
          name: req.body.schoolName,
          email: req.body.email,
          courseCategoryId: req.body.courseCategoryId,
          creator: result._id,
        });
        await result.updateOne({
          schoolId: school._id,
        });
        await result.save();

        //create classes according to the course category
        await AuthServices.createClassesForSchool(
          req.body.courseCategoryId,
          school,
          result,
          res
        );
      }

      // if role is a teacher && there are className and courseId in body
      // create class with the info
      if (role === "602f3ce39b146b3201c2dc1d") {
        customerRole = "Teacher";
        let classCode = await Helper.generateCode(8);
        const existingClassCode = await ClassModel.findOne({
          classCode,
        });
        if (existingClassCode) {
          classCode = await Helper.generateCode(8);
        }
        const newClass = await ClassModel.create({
          userId: result._id,
          name: req.body.className,
          courseId: req.body.courseId,
          classCode,
          subjectIds: req.body.subjectIds,
        });

        await enrolledCourse.update(
          {
            classId: newClass._id,
          },
          {
            new: true,
          }
        );
        await enrolledCourse.save();
      }

      const user = await AuthServices.emailExist(email, res);
      const token = await Helper.generateToken(result._id, role, fullName);

      const htmlMessage = `<html>
      <head>
        <title></title>
        <link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
      </head>
      <body>
      <div>Hello ${fullName},</div>
      
      <div>&nbsp;</div>
      
      <div>&nbsp;</div>
      
      <div>We are glad to have you register on Afrilearn but it&#39;s not done yet. We will need to send you important information about us and it is important that we have an accurate email address.</div>
      
      <div>&nbsp;</div>
      
      <div>&nbsp;</div>
      
      <div>Please, simply verify your email address below to continue unfettered access to all that the Afrilearn platform offers.</div>
      
      <div>&nbsp;</div>
      
      <div><a href="https://myafrilearn.com?uuid=${token}">Click Here to Confirm Your Email Address</a></div>
      
      <div>&nbsp;</div>
      
      <div>If this does not work, copy this link and paste it in your browser - https://myafrilearn.com?uuid=${token}</div>
      
      <div>&nbsp;</div>
      
      <div>&nbsp;</div>
      
      <div>Do this now and start your fun learning experience.</div>
      
      <div>&nbsp;</div>
      
      <div>Sincerely,</div>
      
      <div>The Afrilearn Team.</div>
      
      <div>&nbsp;</div>
      
      <div>-- --- -- -- - - - - - - - - - - - -&nbsp;</div>
      
      <br/>
      <br/>
      <br/>
      
      <div><a href="https://play.google.com/store/apps/details?id=com.afrilearn">Download Afrilearn on Android</a></div>
      
      <div>Download Afrilearn on iOS</div>
      
      <div><a href="https://myafrilearn.com/">Visit Afrilearn on Web</a></div>
      
      <div>For customer support - care@myafrilearn.com</div>
      
      <div>--- - - - - --- ---- --- --- -- -- -- -</div>
      </body>
      </html>
      `;
      const message = `Hi, ${fullName}, welcome to Afrilearn. <br/> click the link to activate your account https://myafrilearn.com?uuid=${token}`;
      const adminMessage = `Hi, ${fullName} just created a new ${customerRole}'s account`;

      sendEmail(email, "Confirm Your Email Address Now!", htmlMessage);
      sendEmail("africustomers@gmail.com", "New Customer", adminMessage);

      return res.status(201).json({
        status: "success",
        data: {
          token,
          user,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating new user",
      });
    }
  }

  /**
   * Activate user account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async activateAccount(req, res) {
    try {
      const { id } = req.data;

      const newData = {
        isActivated: true,
      };

      const user = await Auth.findByIdAndUpdate(id, {
        ...newData,
      });

      const emailMessage = `<html>
      <head>
        <title></title>
        <link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
      </head>
      <body>
      <div>Hello ${user.fullName},</div>
      
      <div>&nbsp;</div>
      
      <div>Welcome to Afrilearn; Africa&rsquo;s best-loved eLearning brand designed to enable you or your ward to learn with fun - we provide world-class and affordable education leveraging technology.</div>
      
      <div>Your experience on the Afrilearn platform is limited until you subscribe to gain access to all our content and features.<br />
      Some of the content and features you will enjoy upon subscribing are:</div>
      
      <ul>
        <li>Unlimited Class Notes</li>
        <li>Unlimited video lessons</li>
        <li>Live assessment and instant result</li>
        <li>Over 5000 past questions across WAEC, JAMB, BECE, Common Entrance, and more</li>
        <li>Interact and Learn from other users live</li>
        <li>Ask a Tutor for help on assignments</li>
        <li>Win N5000 ($15) or more weekly competing on Afri-Challenge</li>
        <li>Daily, Weekly and Lifetime Performance Summary across all subjects</li>
        <li>Join your favourite teacher&#39;s classroom to learn</li>
        <li>Personalized learning experience</li>
      </ul>
      
      <div>We can go on and on but why talk so much when you can simply subscribe now to enjoy all these and more. With just N9999 ($25), you can have unlimited access for ONE WHOLE YEAR.</div>
      
      <div>&nbsp;</div>
      
      <div>Subscribe Now!</div>
      
      <div>&nbsp;</div>
      
      <div>Monthly, Quarterly and Bi-Annual subscriptions are also available. <a href="https://myafrilearn.com/select-pay">Subscribe Here Now!</a></div>
      
      <div>&nbsp;</div>
      
      <div>If you are a Teacher, here&#39;s how you can get the best experience on Afrilearn</div>
      
      <div>As a Parent, these are some of the ways Afrilearn can serve you and your kids</div>
      
      <div>As a school, you can serve all your students from the Afrilearn platform</div>
      
      <div>&nbsp;</div>
      
      <div>Feel free to reply to this email if you are having any challenges on Afrilearn and a member of our team will be in touch to help you out.</div>
      
      <div>&nbsp;</div>
      
      <div>Welcome to the land of fun learning!</div>
      
      <div>&nbsp;</div>
      
      <div><a href="https://myafrilearn.com/select-pay">Subscribe Here Now!</a></div>
      
      <div>&nbsp;</div>
      
      <div>Sincerely,</div>
      
      <div>The Afrilearn Team.</div>
      
      <div>&nbsp;</div>
      
      <div><br />
      &nbsp;</div>
      
      <div>-- --- -- -- - - - - - - - - - - - -&nbsp;</div>
      
      <div><a href="https://play.google.com/store/apps/details?id=com.afrilearn">Download Afrilearn on Android</a></div>
      
      <div>Download Afrilearn on iOS</div>
      
      <div><a href="https://myafrilearn.com/">Visit Afrilearn on Web</a></div>
      
      <div>For customer support - care@myafrilearn.com</div>
      
      <div>--- - - - - --- ---- --- --- -- -- -- -</div>
      </body>
      </html>
      `;

      sendEmail(
        user.email,
        "Welcome to Afrilearn - Land of Fun Learning",
        emailMessage
      );
      return res.status(200).json({
        status: "success",
        data: {
          message: "Account activation successful",
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error activating user account",
      });
    }
  }

  /**
   * Login user.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await AuthServices.emailExist(email, res);

      if (!user) {
        return res.status(401).json({
          status: "401 Unauthorized",
          error:
            "Sorry, your email was incorrect. Please double-check your email.",
        });
      }

      const confirmPassword = await Helper.verifyPassword(
        password,
        user.password
      );

      if (!confirmPassword) {
        return res.status(401).json({
          status: "401 Unauthorized",
          error:
            "Sorry, your password was incorrect. Please double-check your password.",
        });
      }

      const token = await Helper.generateToken(
        user.id,
        user.role,
        user.fullName
      );

      return res.status(200).json({
        status: "success",
        data: {
          token,
          user,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error:
          "Sorry, you are unable to login. If you registered through google try logging by clicking login with google below. Thank you.",
      });
    }
  }

  /**
   * Reset Password.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async resetPassword(req, res) {
    try {
      const { email } = req.params;
      //

      const user = Auth.findOne({
        email,
      });
      if (!user) {
        return res.status(404).json({
          status: "404 Internal server error",
          error:
            "Sorry, there’s no Afrilearn account with this email address. Click Register to create a free account.",
        });
      }

      const Time = new Date();
      const expiringDate = Time.setDate(Time.getDate() + 1);
      await ResetPassword.deleteOne({
        email,
      });

      const token = await Helper.generateCode(5);

      const data = {
        email,
        expiringDate,
        token,
      };

      await ResetPassword.create({
        ...data,
      });
      const message = `Click on the link below to reset your password<br/>Click the link https://myafrilearn.com/change_password?token=${token}&email=${email} <br/> Link Expires in 24 hours.`;
      sendEmail(email, "Password Reset", message);
      return res.status(201).json({
        status: "success",
        message: "Password reset link sent to your mail",
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error reseting password",
      });
    }
  }

  /**
   * Change Password.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async changePassword(req, res) {
    try {
      const { email, password } = req.body;
      const encryptpassword = await Helper.encrptPassword(password);
      const newData = {
        password: encryptpassword,
      };
      await Auth.findOneAndUpdate(
        {
          email,
        },
        {
          ...newData,
        }
      );

      return res.status(200).json({
        status: "success",
        message: "Password changed successfully",
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error changing password",
      });
    }
  }

  /**
   * Update Profile
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async updateProfile(req, res) {
    try {
      const user = await Auth.findOne({
        _id: req.data.id,
      });

      if (req.body.fullName) {
        user["fullName"] = req.body.fullName;
      }
      if (req.body.pushToken) {
        user["pushToken"] = req.body.pushToken;
      }

      if (req.body.alternateReferralCode) {
        await AuthServices.referralExist(req.body.alternateReferralCode, res);
        user["alternateReferralCode"] = req.body.alternateReferralCode;
      }

      //add afriCoins for referee via social login
      if (req.body.referralCode) {
        let referee;
        if (mongoose.isValidObjectId(req.body.referralCode)) {
          user.referee = req.body.referralCode;
          referee = await Auth.findById(req.body.referralCode);
        } else {
          referee = await Auth.findOne({
            alternateReferralCode: req.body.referralCode,
          });
          user.referee = referee.id;
        }

        if (referee) {
          referee.afriCoins += 100;
          await referee.save();
          const data1 = {
            description: "Referrals",
            type: "add",
            amount: 100,
            free: true,
          };
          if (mongoose.isValidObjectId(req.body.referralCode)) {
            data1["userId"] = req.body.referralCode;
          } else {
            data1["userId"] = referee.id;
          }
          await AfriCoinTransaction.create(data1);
        }
      }

      if (req.body.channel) {
        user["channel"] = req.body.channel;
      }

      if (req.body.phoneNumber) {
        user["phoneNumber"] = req.body.phoneNumber;
      }

      if (req.body.dateOfBirth) {
        user["dateOfBirth"] = req.body.dateOfBirth;
      }

      if (req.body.feedBack) {
        user["feedBack"] = req.body.feedBack;
      }
      if (req.body.rating) {
        user["rating"] = req.body.rating;
      }
      if (req.body.country) {
        user["country"] = req.body.country;
      }

      if (req.body.bankId) {
        user["bankId"] = req.body.bankId;
      }
      if (req.body.bank) {
        user["bank"] = req.body.bank;
      }

      if (req.body.accountNumber) {
        user["accountNumber"] = req.body.accountNumber;
      }

      if (req.body.accountName) {
        user["accountName"] = req.body.accountName;
      }

      if (req.body.state) {
        user["state"] = req.body.state;
      }

      if (req.body.gender) {
        user["gender"] = req.body.gender;
      }

      if (req.body.role) {
        user["role"] = req.body.role;
      }

      if (req.body.referralLink) {
        user["referralLink"] = req.body.referralLink;
      }

      if (req.body.referee) {
        user["referee"] = req.body.referee;
      }

      await user.save();
      if (req.body.courseId) {
        const enrolledCourse = await EnrolledCourse.create({
          userId: user._id,
          courseId: req.body.courseId,
        });

        if (
          req.body.role === "602f3ce39b146b3201c2dc1d" &&
          req.body.className
        ) {
          let classCode = await Helper.generateCode(8);
          const existingClassCode = await ClassModel.findOne({
            classCode,
          });
          if (existingClassCode) {
            classCode = await Helper.generateCode(8);
          }
          const newClass = await ClassModel.create({
            userId: user._id,
            name: req.body.className,
            courseId: req.body.courseId,
            classCode,
          });

          await enrolledCourse.update(
            {
              classId: newClass._id,
            },
            {
              new: true,
            }
          );
          await enrolledCourse.save();
        }
      }

      //if school role, create school profile
      if (
        req.body.role === "607ededa2712163504210684" &&
        req.body.courseCategoryId &&
        req.body.schoolName
      ) {
        const school = await School.create({
          name: req.body.schoolName,
          email: user.email,
          courseCategoryId: req.body.courseCategoryId,
          creator: user._id,
        });

        await EnrolledCourse.create({
          userId: user._id,
          schoolId: school._id,
        });

        //create classes according to the course category
        await AuthServices.createClassesForSchool(
          req.body.courseCategoryId,
          school,
          res
        );
      }

      const token = await Helper.generateToken(
        user._id,
        user.role,
        user.fullName
      );

      const user2 = await AuthServices.emailExist(user.email, res);
      if (req.body.feedBack && req.body.rating) {
        //send email to
        sendEmail(
          "care@myafrilearn.com",
          `Feedback from ${user.fullName}`,
          `${user.fullName} submitted feedback and rating. \n What could we do to improve your Experience?: ${req.body.feedBack}\n How likely are you to recommend Afrilearn to a friend or colleague?: ${req.body.rating}/10`
        );
      }
      return res.status(200).json({
        status: "success",
        data: {
          token,
          user: user2,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: err.message,
      });
    }
  }

  /**
   * Return Roles and Classes
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async getRoles(req, res) {
    try {
      let roles = await Role.find();
      const courses = await Course.find({}).sort({ categoryId: -1, _id: 1 });
      const courseCategories = await CourseCategory.find();
      const students = await Auth.countDocuments({
        role: "5fd08fba50964811309722d5",
      });
      const teachers = await Auth.countDocuments({
        role: "602f3ce39b146b3201c2dc1d",
      });
      const allUsers = await Auth.countDocuments();
      const numberOfClassNote = await Lesson.countDocuments();
      const numberOfQuizQuestions = await Question.countDocuments();
      // const lesson = await Lesson.find().populate({
      //   path: 'questions',
      // });;
      // let numberOfClassnote = lesson.length;
      // let numberOfVideoLesson = 0;
      // let numberOfQuizQuestions = 0;

      roles = roles.filter((item) => item.id !== "602f3cf79b146b3201c2dc1e");

      // let l = 0;
      // for (l = 0; l < lesson.length; l++){
      //   numberOfVideoLesson += lesson[l].videoUrls.length;
      //   if(lesson[l].questions && lesson[l].questions.length){
      //     numberOfQuizQuestions += lesson[l].questions.length;
      //   }
      // }

      return res.status(200).json({
        status: "success",
        data: {
          roles,
          courses,
          students,
          teachers,
          numberOfClassNote,
          numberOfQuizQuestions,
          courseCategories,
          allUsers,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error changing password",
      });
    }
  }

  /**
   * Load user.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async loadUser(req, res) {
    try {
      const owner = await AuthServices.getEmail(req.data.id, res);
      const roles = await Role.find();
      const courses = await Course.find();
      if (!owner) {
        return res.status(404).json({
          status: "400 Not found",
          error: "User does not exist",
        });
      }
      const user = await AuthServices.emailExist(owner.email, res);
      const token = await Helper.generateToken(
        user._id,
        user.role,
        user.fullName
      );
      return res.status(200).json({
        status: "success",
        data: {
          token,
          user,
          roles,
          courses,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading user",
      });
    }
  }

  /**
   * check if  user exist and join class
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async checkUserExistAndJoin(req, res) {
    try {
      // user lands on join class page with email and classid
      // if user exists
      const user = await Auth.findOne({
        email: req.body.email,
      });
      if (user) {
        const existingClassMember = await ClassMember.findOne({
          classId: req.body.classId,
          userId: user._id,
        });
        if (existingClassMember) {
          return res.status(400).json({
            status: "400 Bad request",
            error: "Classmember already exist",
          });
        }
        const classMember = await ClassMember.create({
          classId: req.body.classId,
          userId: user._id,
          status: "approved",
        });
        return res.status(200).json({
          status: "success",
          data: {
            message: "Your class request was approved.",
            classMember,
            user,
          },
        });
      }
      return res.status(404).json({
        status: "success",
        data: {
          message: "User not found",
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading user",
      });
    }
  }

  /**
   * check if  user exist and join class
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async moveUsers(req, res) {
    try {
      // user lands on join class page with email and classid
      // if user exists

      //   Get students : https://classnotes.ng/wp-json/llms/v1/students?context=edit&per_page=100&page=3
      // const student_enrollment_links = student._links.enrollments[0].href
      // Get student enrollments : https://classnotes.ng/wp-json/llms/v1/students/7/enrollments
      // const membership_link = enrollment._links.post.find(post=> post.type === "llms_membership").href
      // https://classnotes.ng/wp-json/llms/v1/memberships/78

      // const users = JSON.parse(Users);

      // //console.log("First", users[0]);
      const enrlist = [];
      let count = 0;
      // for (let index = 0; index < NewUsers.data.users.length; index++) {
      // const newuser = NewUsers.data.users[index];

      // const encryptpassword = await Helper.encrptPassword(user.last_name);
      // if()
      // const isOld = Students.data.users.find(
      //   (user) => user.email !== newuser.email
      // );
      // if (isOld) {
      //   enrlist.push(isOld);
      // }

      // const newUser = {
      //   fullName: user.name,
      //   password: encryptpassword,
      //   email: user.email,
      //   role: "5fd08fba50964811309722d5",
      // };
      // const createdUser = await Auth.create({ ...newUser });
      // }
      // for (let index = 0; index < _7_8_2021.length; index++) {
      //   const user = _7_8_2021[index];
      //   const existingUser = await Auth.findOne({
      //     email: user.email,
      //   });
      //   if (!existingUser) {
      //     count++;

      //     //create user
      //     //add referralLink=classnote
      //     const encryptpassword = await Helper.encrptPassword(user.last_name);
      //     const newUser = {
      //       fullName: user.name,
      //       password: encryptpassword,
      //       email: user.email,
      //       role: "5fd08fba50964811309722d5",
      //       referralLink: "classnote",
      //     };
      //     const createdUser = await Auth.create({ ...newUser });
      //     //enroll in sss1 and add enddate = current date + 1 month

      //     await EnrolledCourse.create({
      //       userId: createdUser._id,
      //       courseId: "5fff72b3de0bdb47f826feaf",
      //       endDate: "2021-08-08T10:22:56.825+00:00",
      //     });

      //     enrlist.push(createdUser);
      //   }

      //   // //console.log(student);
      //   // enrlist.push(existingUser);
      // }

      // const count = NewUsers.data.users.length;

      return res.status(200).json({
        status: "success",
        data: {
          old: count,
          enrlist,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading user",
      });
    }
  }

  /**
   * Update profile pic
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async uploadProfilePic(req, res) {
    try {
      // user lands on join class page with email and classid
      // if user exists

      const user = await Auth.findOneAndUpdate(
        {
          _id: req.data.id,
        },
        {
          profilePhotoUrl: req.file.location,
        },
        {
          new: true,
        }
      );

      if (!user) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Error finding user",
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          user,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading user",
      });
    }
  }

  static async getActiveSubscriptions(req, res) {
    try {
      const enrolledCourses = await EnrolledCourse.find({
        userId: req.params.userId,
      });
      const actives = [];
      enrolledCourses.forEach((course) => {
        if (course.endDate > Date.now()) {
          actives.push(course.courseId);
        }
      });

      return res.status(200).json({
        status: "success",
        data: { actives },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Get Subscriptions",
      });
    }
  }

  static async deleteStuff(req, res) {
    try {
      const deleteWorthies = [];
      const rrr = await Transaction.find({}).populate("userId");
      rrr.forEach(async (r) => {
        if (r.userId === null) {
          await r.delete();
          deleteWorthies.push(r);
        }
      });
      console.log("deleteWorthies", deleteWorthies.length);
      res.send(deleteWorthies);
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

export default AuthController;
