import AdminRole from "../db/models/adminRole.model";
import ClassModel from "../db/models/classes.model";
import Course from "../db/models/courses.model";
import School from "../db/models/schoolProfile";
import Auth from "../db/models/users.model";

import Helper from "../utils/user.utils";
import sendEmail from "../utils/email.utils";
import AuthServices from "../services/auth.services";
import ResetPassword from "../db/models/resetPassword.model";
import Role from "../db/models/roles.model";
import EnrolledCourse from "../db/models/enrolledCourses.model";
import ClassMember from "../db/models/classMembers.model";
import Lesson from "../db/models/lessons.model";
import Question from "../db/models/questions.model";
import mongoose from "mongoose";

import Userz from "../../users.json";
import Students from "../../students.json";
import NewUsers from "../../NewUsers.json";
import OldUsers from "../../old.json";
import axios from "axios";
import CourseCategory from "../db/models/courseCategories.model";

/**
 *Contains School Controller
 *
 *
 *
 * @class SchoolController
 */
class SchoolController {
  /**
   * get a school profile
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof SchoolController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getSchoolProfile(req, res) {
    try {
      const { schoolId } = req.params;

      let schoolClassesData = [];

      const school = await School.findOne({
        _id: schoolId,
      });
      const numOfStudents = await Auth.countDocuments({
        schoolId,
        role: "5fd08fba50964811309722d5",
      });
      const numOfClassTeachers = await Auth.countDocuments({
        schoolId,
        role: "602f3ce39b146b3201c2dc1d",
      });
      const numOfAdminTeachers = await AdminRole.countDocuments({
        schoolId,
      });
      const numOfTeachers = numOfClassTeachers + numOfAdminTeachers;

      const schoolClasses = await ClassModel.find(
        {
          schoolId,
        },
        {
          name: 1,
          userId: 1,
          courseId: 1,
        }
      ).populate("courseId");

      for (let i = 0; i < schoolClasses.length; i++) {
        let numOfClassTeachers = await AdminRole.countDocuments({
          schoolId,
          classId: schoolClasses[i].id,
        });

        if (schoolClasses[i].userId) {
          ++numOfClassTeachers;
        }

        const data = {
          className: schoolClasses[i].name,
          numOfClassTeachers,
          courseId: schoolClasses[i].courseId._id,
          courseName: schoolClasses[i].courseId.name,
          classId: schoolClasses[i].id,
        };
        schoolClassesData.push(data);
      }

      return res.status(201).json({
        status: "success",
        data: {
          numOfStudents,
          numOfTeachers,
          schoolClassesData,
          profile: school,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting school profile",
      });
    }
  }

  /**
   * get a school courses
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof SchoolController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getSchoolCourses(req, res) {
    try {
      const { schoolId } = req.params;
      const school = await School.findOne({ _id: schoolId });

      const schoolCourses = await Course.find({
        categoryId: school.courseCategoryId,
      })
        .populate({
          path: "relatedSubjects",
          populate: "mainSubjectId courseId",
        })
        .populate({
          path: "relatedPastQuestions",
          populate: "pastQuestionTypes",
        });

      return res.status(201).json({
        status: "success",
        data: {
          courses: schoolCourses,
          profile: school,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting school profile",
      });
    }
  }

  /**
   * School Create account for a student.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async signUpForStudent(req, res) {
    try {
      let customerRole = "Student";
      const {
        fullName,
        password,
        email,
        classId,
        schoolId,
        courseId,
      } = req.body;

      const encryptpassword = await Helper.encrptPassword(password);
      const existingUser = await Auth.findOne({
        email,
      });
      if (existingUser) {
        return res.status(400).json({
          status: "400 Not found",
          error: "Email already exist",
        });
      }
      const existingSchool = await School.findOne({
        _id: schoolId,
      });
      if (!existingSchool) {
        return res.status(404).json({
          status: "404 Not found",
          error: "School is not registered",
        });
      }

      const existingSchoolClass = await ClassModel.findOne({
        schoolId,
        courseId,
      });

      if (!existingSchoolClass) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Class is not registered to your school",
        });
      }

      const newUser = {
        fullName,
        password: encryptpassword,
        email,
        role: "5fd08fba50964811309722d5",
        schoolId,
      };

      const result = await Auth.create({
        ...newUser,
      });

      await ClassMember.create({
        userId: result._id,
        classId,
        status: "approved",
      });

      await EnrolledCourse.create({
        courseId,
        userId: result._id,
      });

      const message = `Hi, ${fullName}, your school just created a new ${customerRole}'s account for you.`;
      const adminMessage = ` ${existingSchool.name}, just created a new ${customerRole}'s account for ${fullName}.`;

      sendEmail(email, "Welcome to Afrilearn", message);
      sendEmail("africustomers@gmail.com", "New Customer", adminMessage);
      sendEmail(existingSchool.email, "Student Registered", adminMessage);

      return res.status(201).json({
        status: "success",
        data: {
          user: result,
          password,
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
   * School Create account for a Teacher.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async signUpForTeacher(req, res) {
    try {
      let customerRole = "Teacher";
      const { fullName, password, email, schoolId, courseId } = req.body;

      const encryptpassword = await Helper.encrptPassword(password);

      const existingUser = await Auth.findOne({
        email,
      });
      if (existingUser) {
        return res.status(400).json({
          status: "400 Not found",
          error: "Email already exist",
        });
      }

      const existingSchool = await School.findOne({
        _id: schoolId,
      });
      if (!existingSchool) {
        return res.status(404).json({
          status: "404 Not found",
          error: "School is not registered",
        });
      }

      const newUser = {
        fullName,
        password: encryptpassword,
        email,
        role: "602f3ce39b146b3201c2dc1d",
        schoolId,
      };

      const existingTeacherforClass = await ClassModel.findOne({
        schoolId,
        courseId,
      });

      if (!existingTeacherforClass) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Class is not registered to your school",
        });
      }

      const result = await Auth.create({
        ...newUser,
      });
      // if teacher exists already, add the new teacher to admin

      if (existingTeacherforClass.userId) {
        const data = {
          roleDescription: "teacher",
          userId: result.id,
          schoolId,
          classId: existingTeacherforClass._id,
        };
        await AdminRole.create({
          ...data,
        });
      } else {
        existingTeacherforClass.userId = result.id;
        existingTeacherforClass.save();
      }

      const message = `Hi, ${fullName}, your school just created a new ${customerRole}'s account for you.`;
      const adminMessage = ` ${existingSchool.name}, just created a new ${customerRole}'s account for ${fullName}.`;

      sendEmail(email, "Welcome to Afrilearn", message);
      sendEmail("africustomers@gmail.com", "New Customer", adminMessage);
      sendEmail(existingSchool.email, "Student Registered", adminMessage);

      return res.status(201).json({
        status: "success",
        data: {
          user: result,
          password,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating new teacher account",
      });
    }
  }

  /**
   * School Create account for an Admin.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async signUpForSchoolAdmin(req, res) {
    try {
      let customerRole = "Admin";
      const { fullName, password, email, schoolId, roleDescription } = req.body;

      const encryptpassword = await Helper.encrptPassword(password);

      const existingUser = await Auth.findOne({
        email,
      });
      if (existingUser) {
        return res.status(400).json({
          status: "400 Not found",
          error: "Email already exist",
        });
      }

      const existingSchool = await School.findOne({
        _id: schoolId,
      });
      if (!existingSchool) {
        return res.status(404).json({
          status: "404 Not found",
          error: "School is not registered",
        });
      }

      const newUser = {
        fullName,
        password: encryptpassword,
        email,
        role: "607ededa2712163504210684",
        schoolId,
      };

      const result = await Auth.create({
        ...newUser,
      });

      // if teacher exists already, add the new teacher to admin

      const data = {
        roleDescription: roleDescription || "Admin",
        userId: result._id,
        schoolId,
      };
      await AdminRole.create({
        ...data,
      });

      const message = `Hi, ${fullName},  ${existingSchool.name} just created a new ${customerRole}'s account for you.`;
      const adminMessage = ` ${existingSchool.name}, just created a new ${customerRole}'s account for ${fullName}.`;

      sendEmail(email, "Welcome to Afrilearn", message);
      sendEmail("africustomers@gmail.com", "New Customer", adminMessage);
      sendEmail(existingSchool.email, "Admin Registered", adminMessage);

      return res.status(201).json({
        status: "success",
        data: {
          user: result,
          password,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating new admin account",
      });
    }
  }

  /**
   * School Create add teacher to class.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async schoolAddExistingTeacher(req, res) {
    try {
      let customerRole = "Teacher";
      const { email, schoolId, classId } = req.body;

      const existingSchool = await School.findOne({
        _id: schoolId,
      });
      if (!existingSchool) {
        return res.status(404).json({
          status: "404 Not found",
          error: "School is not registered",
        });
      }

      const existingUser = await Auth.findOne({
        email,
      });
      if (!existingUser) {
        return res.status(400).json({
          status: "400 Bad request",
          error:
            "Teacher with this email not found, Add a name and password to craete a new account",
        });
      }
      if (
        existingUser &&
        existingUser.role.toString() !== "602f3ce39b146b3201c2dc1d"
      ) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "The user you are trying to Add is not a Teacher",
        });
      }
      if (
        existingUser &&
        existingUser.schoolId &&
        existingUser.schoolId.toString() !== schoolId
      ) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Teacher is registered with another school",
        });
      }

      const classHasExistingTeacher = await ClassModel.findOne({
        _id: classId,
        schoolId,
      });
      if (!classHasExistingTeacher) {
        return res.status(404).json({
          status: "404 Bad request",
          error: "Class not registered to this school",
        });
      }
      //send teacher email to join this school as a teacher

      const message = `Hi ${existingUser.fullName}, ${existingSchool.name} is requesting you to join ${existingSchool.name} as a Teacher. \n Click this link to accept the request https://www.myafrilearn.com/accept-request?role=teacher&email=${email}&schoolId=${schoolId}&classId=${classId}`;
      const adminMessage = ` ${existingSchool.name}, your teacher request has been sent to ${existingUser.fullName}.`;

      sendEmail(email, "Teacher request", message);
      // sendEmail("africustomers@gmail.com", "New Customer", adminMessage);
      sendEmail(existingSchool.email, "Teacher request sent", adminMessage);

      return res.status(201).json({
        status: "success",
        data: {
          message: "Request sent",
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
   * Accept School admin request.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async acceptTeacherRequest(req, res) {
    try {
      const { email, schoolId, classId } = req.body;

      const existingSchool = await School.findOne({
        _id: schoolId,
      });
      if (!existingSchool) {
        return res.status(404).json({
          status: "404 Not found",
          error: "School is not registered",
        });
      }

      const existingUser = await Auth.findOne({
        email,
      });
      if (!existingUser) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Your email is not registered",
        });
      }

      const classHasExistingTeacher = await ClassModel.findOne({
        _id: classId,
        schoolId,
      });
      if (!classHasExistingTeacher) {
        return res.status(404).json({
          status: "404 Bad request",
          error: "Class not registered to this school",
        });
      }

      existingUser.schoolId = schoolId;
      await existingUser.save();

      if (classHasExistingTeacher && classHasExistingTeacher.userId) {
        //add new teacher to admins
        await AdminRole.create({
          roleDescription: "Teacher",
          userId: existingUser._id,
          classId,
          schoolId,
        });
        const message = `Hi, ${existingUser.fullName}, your are now an Admin at ${existingSchool.name}.\n Click this link to continue to your dashboard https://www.myafrilearn.com/dashboard`;
        const adminMessage = ` ${existingSchool.name}, ${existingUser.fullName} accepted your request.`;

        sendEmail(email, "Congratulations!", message);
        sendEmail(existingSchool.email, "Request Accepted", adminMessage);
        return res.status(201).json({
          status: "success",
          data: {
            message: "Request Accepted",
          },
        });
      }
      //Add  teacher to class s
      classHasExistingTeacher.userId = existingUser._id;
      await classHasExistingTeacher.save();

      // Send Admin request email

      const message = `Hi ${existingUser.fullName}, you are now a Teacher at ${existingSchool.name}. \n Click this link to continue to your dashboard https://www.myafrilearn.com/dashboard`;

      const adminMessage = ` ${existingSchool.name},  ${existingUser.fullName} is now a Teacher at your school.`;

      sendEmail(email, "Congratulations! ", message);
      sendEmail(existingSchool.email, "Teacher request accepted", adminMessage);
      return res.status(201).json({
        status: "success",
        data: {
          message: "Request Accepted",
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error accepting request",
      });
    }
  }

  /**
   * School makes teacher an admin.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async makeTeacherAdmin(req, res) {
    try {
      const { email, schoolId, classId } = req.body;

      const existingSchool = await School.findOne({
        _id: schoolId,
      });
      if (!existingSchool) {
        return res.status(404).json({
          status: "404 Not found",
          error: "School is not registered",
        });
      }

      const existingUser = await Auth.findOne({
        email,
      });
      if (!existingUser) {
        return res.status(400).json({
          status: "400 Bad request",
          error:
            "Teacher with this email not found, Add a name and password to craete a new account",
        });
      }

      const existingClass = await ClassModel.findOne({
        _id: classId,
        schoolId,
      });

      if (classId && !existingClass) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Class not registered to this School",
        });
      }

      const message = `Hi ${existingUser.fullName}, ${existingSchool.name} is requesting you to join ${existingSchool.name} as an Admin. \n Click this link to accept the request https://www.myafrilearn.com/accept-request?role=admin&email=${email}&schoolId=${schoolId}&classId=${classId}`;

      const adminMessage = ` ${existingSchool.name}, your Admin request has been sent to ${existingUser.fullName}.`;

      sendEmail(email, "Admin request", message);
      sendEmail(existingSchool.email, "Admin request sent", adminMessage);
      return res.status(201).json({
        status: "success",
        data: {
          message: "Admin request has been sent",
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error sending request",
      });
    }
  }

  /**
   * Accept School admin request.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async acceptAdminRequest(req, res) {
    try {
      const { email, schoolId, classId } = req.body;

      const existingSchool = await School.findOne({
        _id: schoolId,
      });
      if (!existingSchool) {
        return res.status(404).json({
          status: "404 Not found",
          error: "School is not registered",
        });
      }

      const existingUser = await Auth.findOne({
        email,
      });
      if (!existingUser) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Your email is not registered",
        });
      }

      //add teacher to admins
      existingUser.schoolId = schoolId;
      existingUser.save();
      const admin = await AdminRole.create({
        roleDescription: "Admin",
        userId: existingUser._id,
        classId,
        schoolId,
      });

      // Send Admin request email

      const message = `Hi ${existingUser.fullName}, you are now an Admin at ${existingSchool.name}. \n Click this link to continue to your dashboard https://www.myafrilearn.com/dashboard`;

      const adminMessage = ` ${existingSchool.name},  ${existingUser.fullName} is now an Admin at your school.`;

      sendEmail(email, "Congratulations! You are an Admin", message);
      sendEmail(existingSchool.email, "Admin request accepted", adminMessage);
      return res.status(201).json({
        status: "success",
        data: {
          message: "Request Accepted",
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error adding admin",
      });
    }
  }

  /**
   * School unlink teacher account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async unlinkTeacherAccount(req, res) {
    const { userId, schoolId } = req.body;
    try {
      const existingSchool = await School.findOne({
        _id: schoolId,
      });
      if (!existingSchool) {
        return res.status(404).json({
          status: "404 Not found",
          error: "School is not registered",
        });
      }
      const existingSchoolTeacher = await Auth.findOne({
        _id: userId,
        schoolId,
      });

      if (!existingSchoolTeacher) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Teacher is not registered with this School",
        });
      }
      existingSchoolTeacher.schoolId = null;
      await existingSchoolTeacher.save();

      //update related classes
      const classes = await ClassModel.find({
        userId,
        schoolId,
      });
      //console.log("classes", classes.length);

      if (classes.length > 0) {
        for (let index = 0; index < classes.length; index++) {
          const clazz = classes[index];
          // clazz.userId = "";
          await clazz.updateOne({
            userId: null,
          });
          await clazz.save();
        }
      }
      //console.log("1");
      //update related admins
      await AdminRole.findOneAndDelete({
        userId,
        schoolId,
      });
      //console.log("2");

      const message = `Hi ${existingSchoolTeacher.fullName}, ${existingSchool.name} unlinked your account.`;
      const adminMessage = ` ${existingSchool.name} just unlink ${existingSchoolTeacher.fullName}'s account.`;
      const parentMessage = `You just unlinked ${existingSchoolTeacher.fullName}'s account`;

      sendEmail(
        existingSchoolTeacher.email,
        "Your School unlinked your account",
        message
      );
      sendEmail(
        "africustomers@gmail.com",
        "A Customer account unlinked",
        adminMessage
      );
      sendEmail(
        existingSchool.email,
        "Your Child account has been unlinked",
        parentMessage
      );
      //console.log("3");

      return res.status(200).json({
        status: "success",
        data: {
          user: existingSchoolTeacher,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Updating user",
      });
    }
  }

  /**
   * School delete teacher account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async deleteTeacherAccount(req, res) {
    const { userId, schoolId } = req.body;
    try {
      const existingSchool = await School.findOne({
        _id: schoolId,
      });
      if (!existingSchool) {
        return res.status(404).json({
          status: "404 Not found",
          error: "School is not registered",
        });
      }

      const existingSchoolTeacher = await Auth.findOneAndDelete({
        _id: userId,
        schoolId,
      });

      if (!existingSchoolTeacher) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Teacher is not registered with this School",
        });
      }

      //update related classes
      const classes = await ClassModel.find({
        userId,
        schoolId,
      });

      if (classes.length > 0) {
        for (let index = 0; index < classes.length; index++) {
          const clazz = classes[index];
          clazz.userId = "";
          await clazz.save();
        }
      }
      //update related admins
      await AdminRole.findOneAndDelete({
        userId,
        schoolId,
      });

      const message = `Hi ${existingSchoolTeacher.fullName}, ${existingSchool.name} deleted your account.`;
      const adminMessage = ` ${existingSchool.name} just deleted ${existingSchoolTeacher.fullName}'s account.`;
      const parentMessage = `You just deleted ${existingSchoolTeacher.fullName}'s account`;

      sendEmail(
        existingSchoolTeacher.email,
        "Your School deleted your account",
        message
      );
      sendEmail(
        "africustomers@gmail.com",
        "A Customer account deleted",
        adminMessage
      );
      sendEmail(
        existingSchool.email,
        "Your Child account has been deleted",
        parentMessage
      );

      return res.status(200).json({
        status: "success",
        data: {
          user: existingSchoolTeacher,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Deleteing user",
      });
    }
  }

  /**
   * School unlinking student's account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async unlinkStudentAccount(req, res) {
    const { userId, schoolId } = req.body;
    try {
      const existingSchool = await School.findOne({
        _id: schoolId,
      });
      if (!existingSchool) {
        return res.status(404).json({
          status: "404 Not found",
          error: "School is not registered",
        });
      }

      const existingSchoolStudent = await Auth.findOneAndUpdate(
        {
          _id: userId,
          schoolId,
        },
        {
          schoolId: null,
        }
      );

      if (!existingSchoolStudent) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Student is not registered with this School",
        });
      }

      //update related classes
      const classes = await ClassModel.find({
        schoolId,
      });

      if (classes.length > 0) {
        for (let index = 0; index < classes.length; index++) {
          const clazz = classes[index];
          await ClassMember.findOneAndDelete({
            userId,
            classId: clazz._id,
          });
        }
      }

      const message = `Hi ${existingSchoolStudent.fullName}, ${existingSchool.name} unlinked your account.`;
      const adminMessage = ` ${existingSchool.name} just unlink ${existingSchoolStudent.fullName}'s account.`;
      const schoolMessage = `You just unlinked ${existingSchoolStudent.fullName}'s account`;

      sendEmail(
        existingSchoolStudent.email,
        "Your School unlinked your account",
        message
      );
      sendEmail(
        "africustomers@gmail.com",
        "A Customer account unlinked",
        adminMessage
      );
      sendEmail(
        existingSchool.email,
        "Your Student's account has been unlinked",
        schoolMessage
      );

      return res.status(200).json({
        status: "success",
        data: {
          user: existingSchoolStudent,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Updating user",
      });
    }
  }

  /**
   * School delete student account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async deleteStudentAccount(req, res) {
    const { userId, schoolId } = req.body;
    try {
      const existingSchool = await School.findOne({
        _id: schoolId,
      });
      if (!existingSchool) {
        return res.status(404).json({
          status: "404 Not found",
          error: "School is not registered",
        });
      }

      const existingSchoolStudent = await Auth.findOne({
        _id: userId,
        schoolId,
      });

      if (!existingSchoolStudent) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Student is not registered with this School",
        });
      }
      //update related classes
      const classes = await ClassModel.find({
        schoolId,
      });

      if (classes.length > 0) {
        for (let index = 0; index < classes.length; index++) {
          const clazz = classes[index];
          await ClassMember.findOneAndDelete({
            userId,
            classId: clazz._id,
          });
        }
      }

      await existingSchoolStudent.delete();

      const message = `Hi ${existingSchoolStudent.fullName}, ${existingSchool.name} deleted your account.`;
      const adminMessage = ` ${existingSchool.name} just deleted ${existingSchoolStudent.fullName}'s account.`;
      const schoolMessage = `You just deleted ${existingSchoolStudent.fullName}'s account`;

      sendEmail(
        existingSchoolStudent.email,
        "Your School deleted your account",
        message
      );
      sendEmail(
        "africustomers@gmail.com",
        "A Customer account deleted",
        adminMessage
      );
      sendEmail(
        existingSchool.email,
        "Your Student's account has been deleted",
        schoolMessage
      );

      return res.status(200).json({
        status: "success",
        data: {
          user: existingSchoolStudent,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Deleteing user",
      });
    }
  }

  /**
   * Update school logo
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async uploadSchoolLogo(req, res) {
    try {
      const school = await School.findOneAndUpdate(
        {
          creator: req.data.id,
          _id: req.params.schoolId,
        },
        {
          logo: req.file.location,
        },
        {
          new: true,
        }
      );
      if (!school) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Error finding school profile",
        });
      }

      await school.save();
      return res.status(200).json({
        status: "success",
        data: {
          school,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Update profile",
      });
    }
  }

  /**
   * Update school logo
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async uploadSchoolCoverPhoto(req, res) {
    try {
      const school = await School.findOneAndUpdate(
        {
          creator: req.data.id,
          _id: req.params.schoolId,
        },
        {
          coverPhoto: req.file.location,
        },
        {
          new: true,
        }
      );
      if (!school) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Error finding school profile",
        });
      }

      await school.save();
      return res.status(200).json({
        status: "success",
        data: {
          school,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Update profile",
      });
    }
  }

  /**
   * Update school profile
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async updateSchoolProfile(req, res) {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "name",
      "description",
      "regNumber",
      "location",
      "phone",
      "website",
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
      const yourSchool = await School.findOne({
        creator: req.data.id,
      });
      const school = await School.findOne({
        creator: req.data.id,
        _id: req.params.schoolId,
      });
      if (!yourSchool) {
        return res.status(401).json({
          status: "401 Invalid Updates",
          error: "School not registered to you",
        });
      }
      if (!school) {
        return res.status(404).json({
          status: "404 Invalid Updates",
          error: "School not found",
        });
      }
      updates.forEach((update) => {
        school[update] = req.body[update];
      });
      await school.save();

      return res.status(200).json({
        status: "success",
        data: {
          school,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Updating profile",
      });
    }
  }
}
export default SchoolController;
