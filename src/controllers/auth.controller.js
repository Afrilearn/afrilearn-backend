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
      let customerRole = 'Student';
      const { fullName, password, email, role } = req.body;

      const encryptpassword = await Helper.encrptPassword(password);

      const newUser = {
        fullName,
        password: encryptpassword,
        email,
        role,
      };

      const result = await Auth.create({ ...newUser });

      const enrolledCourse = await EnrolledCourse.create({
        userId: result._id,
        courseId: req.body.courseId,
      });

      // if role is a teacher && there are className and courseId in body
      // create class with the info
      if (role === "602f3ce39b146b3201c2dc1d") {
        customerRole = 'Teacher';
        let classCode = await Helper.generateCode(8);
        const existingClassCode = await ClassModel.findOne({ classCode });
        if (existingClassCode) {
          classCode = await Helper.generateCode(8);
        }
        const newClass = await ClassModel.create({
          userId: result._id,
          name: req.body.className,
          courseId: req.body.courseId,
          classCode,
        });

        await enrolledCourse.update({ classId: newClass._id }, { new: true });
        await enrolledCourse.save();
      }

      const user = await AuthServices.emailExist(email, res);
      const token = await Helper.generateToken(result._id, role, fullName);

      
      const message  = `Hi, ${fullName} just created a new ${customerRole}'s account`;
      sendEmail('africustomers@gmail.com', "New Customer", message);

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

      await Auth.findByIdAndUpdate(id, { ...newData });

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
          error: "Invalid email address",
        });
      }

      const confirmPassword = await Helper.verifyPassword(
        password,
        user.password
      );

      if (!confirmPassword) {
        return res.status(401).json({
          status: "401 Unauthorized",
          error: "Invalid password",
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
        error: "Error Logging in user",
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

      const Time = new Date();
      const expiringDate = Time.setDate(Time.getDate() + 1);
      await ResetPassword.deleteOne({ email });

      const token = await Helper.generateCode(5);

      const data = {
        email,
        expiringDate,
        token,
      };

      await ResetPassword.create({ ...data });
      const message = `Click on the link below to reset your password<br/>Click the link http://demo.myafrilearn.com/change_password?token=${token}&email=${email} <br/> Link Expires in 24 hours.`;
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
      await Auth.findOneAndUpdate({ email }, { ...newData });

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
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "fullName",
      "phoneNumber",
      "dateOfBirth",
      "country",
      "state",
      "role",
      "courseId",
      "className",
      "gender",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      return res.status(400).json({
        status: "400 Invalid Updates",
        error: "Error updating profile",
      });
    }
    try {
      const user = await Auth.findOne({ _id: req.data.id });
      updates.forEach((update) => {
        user[update] = req.body[update];
      });
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
          const existingClassCode = await ClassModel.findOne({ classCode });
          if (existingClassCode) {
            classCode = await Helper.generateCode(8);
          }
          const newClass = await ClassModel.create({
            userId: user._id,
            name: req.body.className,
            courseId: req.body.courseId,
            classCode,
          });

          await enrolledCourse.update({ classId: newClass._id }, { new: true });
          await enrolledCourse.save();
        }
      }

      const token = await Helper.generateToken(
        user._id,
        user.role,
        user.fullName
      );

      const user2 = await AuthServices.emailExist(user.email, res);

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
      const courses = await Course.find();    
      const students = await Auth.countDocuments({
        role: '5fd08fba50964811309722d5',
      });
      const teachers = await Auth.countDocuments({
        role: '602f3ce39b146b3201c2dc1d',
      });
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
          numberOfQuizQuestions
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
      const user = await Auth.findOne({ email: req.body.email });
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
        data: { message: "User not found" },
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
      const users = await Auth.find({});

      return res.status(200).json({
        status: "success",
        data: { users },
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
  static async uploadProfilePic(req, res) {
    try {
      // user lands on join class page with email and classid
      // if user exists

      const user = await Auth.findOneAndUpdate(
        { _id: req.data.id },
        { profilePhotoUrl: req.file.location },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Error finding user",
        });
      }

      return res.status(200).json({
        status: "success",
        data: { user },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading user",
      });
    }
  }
}
export default AuthController;
