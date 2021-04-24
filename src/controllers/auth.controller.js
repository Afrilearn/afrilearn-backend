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
import axios from "axios";
import CourseCategory from "../db/models/courseCategories.model";
import Class from "../db/models/classes.model";
import AdminRole from "../db/models/adminRole.model";

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
      const { fullName, password, email, role } = req.body;

      const encryptpassword = await Helper.encrptPassword(password);

      const newUser = {
        fullName,
        password: encryptpassword,
        email,
        role,
      };

      if (
        req.body.referralCode &&
        mongoose.isValidObjectId(req.body.referralCode)
      ) {
        newUser.referee = req.body.referralCode;
      }

      if (req.body.referralLink) {
        newUser.referralLink = req.body.referralLink;
      }

      const result = await Auth.create({ ...newUser });
      let enrolledCourse;
      if (role !== "606ed82e70f40e18e029165e" && role !== '607ededa2712163504210684') {
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
        
        await EnrolledCourse.create({
          userId: result._id,
          schoolId: school._id,
        });

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

      const message = `Hi, ${fullName} just created a new ${customerRole}'s account`;

      sendEmail("africustomers@gmail.com", "New Customer", message);

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

      const existingSchool = await School.findOne({ _id: schoolId });
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
        existingUser.schoolId &&
        existingUser.schoolId.toString() !== schoolId
      ) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Teacher is registered with another school",
        });
      }

      const classHasExistingTeacher = await Class.findOne({
        classId,
        schoolId,
      });
      if (!classHasExistingTeacher) {
        return res.status(404).json({
          status: "404 Bad request",
          error: "Class not registered to this school",
        });
      }

      if (classHasExistingTeacher && classHasExistingTeacher.userId) {
        //add new teacher to admins
        const newAdmin = await AdminRole.create({
          roleDescription: "Teacher",
          userId: existingUser._id,
          classId,
          schoolId,
        });
        const message = `Hi, ${existingUser.fullName}, your school just created a new Admin account for you.`;
        const adminMessage = ` ${existingSchool.name} just created a new Admin account for ${existingUser.fullName}.`;

        sendEmail(email, "Welcome to Afrilearn", message);
        sendEmail("africustomers@gmail.com", "New Customer", adminMessage);
        sendEmail(existingSchool.email, "Student Registered", adminMessage);
        return res.status(201).json({
          status: "success",
          data: {
            user: existingUser,
          },
        });
      } else {
        //Add  teacher to class s
        classHasExistingTeacher.userId = existingUser._id;
        await classHasExistingTeacher.save();
      }

      const message = `Hi ${existingUser.fullName}, your school just created a new ${customerRole}'s account for you.`;
      const adminMessage = ` ${existingSchool.name}, just created a new ${customerRole}'s account for ${existingUser.fullName}.`;

      sendEmail(email, "Welcome to Afrilearn", message);
      sendEmail("africustomers@gmail.com", "New Customer", adminMessage);
      sendEmail(existingSchool.email, "Student Registered", adminMessage);

      return res.status(201).json({
        status: "success",
        data: {
          user: existingUser,
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
   * School makes teacher an admin.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async makeTeacherAdmin(req, res) {
    try {
      const { email, schoolId, classId } = req.body;

      const existingSchool = await School.findOne({ _id: schoolId });
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

      const existingClass = await Class.findOne({
        _id: classId,
        schoolId,
      });
      console.log("existingClass", existingClass);
      if (classId && !existingClass) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Class not registered to this School",
        });
      }

      //add teacher to admins
      const admin = await AdminRole.create({
        roleDescription: "Admin",
        userId: existingUser._id,
        classId,
        schoolId,
      });
      const message = `Hi, ${existingUser.fullName}, ${existingSchool.name} made you an Admin`;
      const adminMessage = ` ${existingSchool.name} added ${existingUser.fullName} as Admin.`;

      sendEmail(email, "You are now an Admin", message);
      sendEmail("africustomers@gmail.com", "New Admin", adminMessage);
      sendEmail(existingSchool.email, "Admin Added", adminMessage);
      return res.status(201).json({
        status: "success",
        data: {
          admin,
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
   * School Create account for a student.
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

      const existingUser = await Auth.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: "400 Not found",
          error: "Email already exist",
        });
      }
     
      const existingSchool = await School.findOne({ _id: schoolId });
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

      const result = await Auth.create({ ...newUser });     
     
      const existingTeacherforClass = await ClassModel.findOne({      
        schoolId,
        courseId
      });
    
      // if teacher exists already, add the new teacher to admin

      if(existingTeacherforClass.userId){    
        const data = {
          roleDescription:'teacher',
          userId:result.id,
          schoolId
        }
        await AdminRole.create({...data})
      }else{
        existingTeacherforClass.userId =result.id;
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
   * School Create account for a student.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async signUpForStudent(req, res) {
    try {
      let customerRole = "Student";
      const { fullName, password, email, classId, schoolId, courseId } = req.body;

      const encryptpassword = await Helper.encrptPassword(password);
      const existingUser = await Auth.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: "400 Not found",
          error: "Email already exist",
        });
      }
      const existingSchool = await School.findOne({ _id: schoolId });
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
        role: "5fd08fba50964811309722d5",
        schoolId,
      };

      const result = await Auth.create({ ...newUser });

      await ClassMember.create({
        userId: result._id,
        classId,
      });
      
      await EnrolledCourse.create({
        courseId,
        userId: result._id        
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
   * Parent Create account for a child.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async signUpForChild(req, res) {
    try {
      let customerRole = "Student";
      const { fullName, password, email, courseId, parentId } = req.body;

      const encryptpassword = await Helper.encrptPassword(password);
      const existingParent = await Auth.findOne({ _id: parentId });
      if (!existingParent) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Parent is not registered",
        });
      }
      const existingUser = await Auth.findOne({
        email: email,
      });
      if (existingUser) {
        return res.status(400).json({
          status: "400 Bad request",
          error: email + " already in use",
        });
      }
      const existingParentChild = await Auth.findOne({
        email: email,
        parentId: parentId,
      });

      if (existingParentChild) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Child already registered to this parent",
        });
      }

      const newUser = {
        fullName,
        password: encryptpassword,
        email,
        role: "5fd08fba50964811309722d5",
        parentId,
      };

      const result = new Auth({ ...newUser });
      await result.save();

      const enrolledCourse = await EnrolledCourse.create({
        userId: result._id,
        courseId,
      });

      const message = `Hi, ${fullName}, your parent just created a new ${customerRole}'s account for you.`;
      const adminMessage = ` ${existingParent.fullName} just created a new ${customerRole}'s account for ${fullName}.`;
      const parentMessage = `You just created a new ${customerRole}'s account for ${fullName}.`;

      sendEmail(email, "Welcome to Afrilearn", message);
      sendEmail("africustomers@gmail.com", "New Customer", adminMessage);
      sendEmail(
        existingParent.email,
        "Your Child is Registered",
        parentMessage
      );

      return res.status(201).json({
        status: "success",
        data: {
          user: result,
          enrolledCourse,
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
   * Parent add an existing child.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async addExistingUserAsChild(req, res) {
    try {
      const { email, parentId } = req.body;
      const existingUser = await Auth.findOne({
        email: email,
      });
      const existingParent = await Auth.findOne({ _id: parentId });
      if (!existingParent) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Parent is not registered",
        });
      }

      if (!existingUser) {
        return res.status(404).json({
          status: "404 Bad request",
          error: "User with this Email not found",
        });
      }

      const existingParentChild = await Auth.findOne({
        email,
        parentId,
      });

      if (existingParentChild) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Child already registered to this parent",
        });
      }

      if (existingUser.parentId && existingUser.parentId !== parentId) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Child already registered to another parent",
        });
      }

      existingUser.parentId = parentId;
      await existingUser.save();

      const message = `Hi, ${existingUser.fullName}, ${existingParent.fullName} added you to children list.`;
      const adminMessage = ` ${existingParent.fullName} just added ${existingUser.fullName} to their children list.`;
      const parentMessage = `You just added ${existingUser.fullName} to your children list.`;

      sendEmail(email, "You parent added you", message);
      sendEmail("africustomers@gmail.com", "New Customer", adminMessage);
      sendEmail(
        existingParent.email,
        "Your Child is Registered",
        parentMessage
      );

      return res.status(200).json({
        status: "success",
        data: {
          user: existingUser,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding user",
      });
    }
  }

  /**
   * Parent unlink child account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async unlinkChildAccount(req, res) {
    const { userId, parentId } = req.body;
    try {
      const existingParentChild = await Auth.findOne({
        _id: userId,
        parentId,
      });

      const existingParent = await Auth.findOne({ _id: parentId });
      if (!existingParent) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Parent is not registered",
        });
      }
      console.log(existingParent);

      if (!existingParentChild) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "You have no parent relationship with this user",
        });
      }

      existingParentChild.parentId = null;
      await existingParentChild.save();

      const message = `Hi, ${existingParentChild.fullName}, ${existingParent.fullName} removed you from children list.`;
      const adminMessage = ` ${existingParent.fullName} just removed ${existingParentChild.fullName} from their children list.`;
      const parentMessage = `You just removed ${existingParentChild.fullName} from your children list.`;

      sendEmail(existingParentChild.email, "You parent removed you", message);
      sendEmail("africustomers@gmail.com", "New Customer", adminMessage);
      sendEmail(
        existingParent.email,
        "Your Child account has been Unlinked to you",
        parentMessage
      );

      return res.status(200).json({
        status: "success",
        data: {
          user: existingParentChild,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Unlinking user",
      });
    }
  }

  /**
   * Parent delete child account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async deleteChildAccount(req, res) {
    const { userId, parentId } = req.body;
    try {
      const existingParentChild = await Auth.findOne({
        _id: userId,
        parentId,
      });

      const existingParent = await Auth.findOne({ _id: parentId });
      if (!existingParent) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Parent is not registered",
        });
      }

      if (!existingParentChild) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "You have no parent relationship with this user",
        });
      }

      await existingParentChild.delete();

      const message = `Hi, ${existingParentChild.fullName}, ${existingParent.fullName} deleted your account.`;
      const adminMessage = ` ${existingParent.fullName} just deleted ${existingParentChild.fullName}'s account.`;
      const parentMessage = `You just deleted ${existingParentChild.fullName}'s account`;

      sendEmail(
        existingParentChild.email,
        "Your parent deleted your account",
        message
      );
      sendEmail(
        "africustomers@gmail.com",
        "A Customer account deleted",
        adminMessage
      );
      sendEmail(
        existingParent.email,
        "Your Child account has been deleted",
        parentMessage
      );

      return res.status(200).json({
        status: "success",
        data: {
          user: existingParentChild,
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
   * School delete teacher account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async deleteTeacherAccount(req, res) {
    const { userId, schoolId } = req.body;
    try {
      const existingSchool = await School.findOne({ _id: schoolId });
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
      const classes = await Class.find({
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
   * School unlink teacher account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async unlinkTeacherAccount(req, res) {
    const { userId, schoolId } = req.body;
    try {
      const existingSchool = await School.findOne({ _id: schoolId });
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
      const classes = await Class.find({
        userId,
        schoolId,
      });
      console.log("classes", classes.length);

      if (classes.length > 0) {
        for (let index = 0; index < classes.length; index++) {
          const clazz = classes[index];
          clazz.userId = "";
          await clazz.save();
        }
      }

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
   * School delete student account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async deleteStudentAccount(req, res) {
    const { userId, schoolId } = req.body;
    try {
      const existingSchool = await School.findOne({ _id: schoolId });
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
   * School unlinking student's account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async unlinkStudentAccount(req, res) {
    const { userId, schoolId } = req.body;
    try {
      const existingSchool = await School.findOne({ _id: schoolId });
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
        { schoolId: null }
      );

      if (!existingSchoolStudent) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Student is not registered with this School",
        });
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
   * Parent Add a course for a child.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async enrollChildInCourse(req, res) {
    try {
      const { email, courseId } = req.body;

      const child = await Auth.findOne({ email: email });
      const parent = req.data;
      if (!child) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Student is not registered",
        });
      }
      if (child.parentId.toString() !== parent.id) {
        return res.status(401).json({
          status: "401 Unautorized",
          error: `You are not the registered Parent of ${child.fullName}`,
        });
      }

      const existingEnrolledCourse = await EnrolledCourse.findOne({
        userId: child._id,
        courseId,
      });
      if (existingEnrolledCourse) {
        return res.status(400).json({
          status: "400 Bad request",
          error: `${child.fullName} is already enrolled to this class`,
        });
      }
      const enrolledCourse = await EnrolledCourse.create({
        userId: child._id,
        courseId,
      });

      const message = `Hi, ${child.fullName}, your parent just enrolled you in a class log in yo your account on https://myafrilearn.com to check out`;
      const adminMessage = ` ${parent.fullName} just enrolled ${child.fullName} to a new course.`;

      sendEmail(email, "Welcome to Afrilearn", message);
      sendEmail("africustomers@gmail.com", "New Customer", adminMessage);
      sendEmail(parent.email, "Student Registered", adminMessage);

      return res.status(201).json({
        status: "success",
        data: {
          enrolledCourse,
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
      const lowerCaseEmail = email.toLowerCase();
      const user = await AuthServices.emailExist(lowerCaseEmail, res);

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
          "Sorry, you are unable to login due to server issues. Please try again. Thank you.",
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

      const user = Auth.findOne({ email });
      if (!user) {
        return res.status(404).json({
          status: "404 Internal server error",
          error:
            "Sorry, there’s no Afrilearn account with this email address. Click Register to create a free account.",
        });
      }

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
      const courseCategories = await CourseCategory.find();
      const students = await Auth.countDocuments({
        role: "5fd08fba50964811309722d5",
      });
      const teachers = await Auth.countDocuments({
        role: "602f3ce39b146b3201c2dc1d",
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
          numberOfQuizQuestions,
          courseCategories,
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

      //   Get students : https://classnotes.ng/wp-json/llms/v1/students?context=edit&per_page=100&page=3
      // const student_enrollment_links = student._links.enrollments[0].href
      // Get student enrollments : https://classnotes.ng/wp-json/llms/v1/students/7/enrollments
      // const membership_link = enrollment._links.post.find(post=> post.type === "llms_membership").href
      // https://classnotes.ng/wp-json/llms/v1/memberships/78

      // const users = JSON.parse(Users);

      // console.log("First", users[0]);
      const enrlist = [];
      for (let index = 0; index < Students.data.users.length; index++) {
        const user = Students.data.users[index];
        await axios
          .get(
            `https://classnotes.ng/wp-json/llms/v1/students/${user.id.toString()}/enrollments`,
            {
              headers: {
                "X-LLMS-CONSUMER-KEY":
                  "ck_bd62ce88aab3f97c05c6dc07c479b186bf01773a",
                "X-LLMS-CONSUMER-SECRET":
                  "cs_61e82f5bf39e487ea765f3e306ce53b030834685",
              },
            }
          )
          .then(function (response) {
            let membership_link = "";
            if (response.data) {
              membership_link = response.data._links.post.find(
                (post) => post.type === "llms_membership"
              ).href;
            }
            // console.log({ user, link: membership_link });
            // enrlist.push(user._links.enrollments[0].href);
            enrlist.push({ user, link: membership_link });
            console.log("1");
          })
          .catch(function (error) {
            console.log("2");
          });
      }

      return res.status(200).json({
        status: "success",
        data: { users: enrlist },
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

  /**
   * Parent's list of children
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async populateParentDashboard(req, res) {
    try {
      const children = await Auth.find({ parentId: req.data.id }).populate({
        path: "enrolledCourses",
        // select: "courseId -userId",
        populate: {
          path: "courseId transaction",
          select: "name alias paymentPlanId",
          populate: { path: "paymentPlanId", select: "name" },
        },
      });
      // .select("fullName");

      if (!children) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Children not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: { children },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading user",
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
    const allowedUpdates = ["name", "description", "regNumber", "location"];
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
      const school = await School.findOne({
        creator: req.data.id,
        _id: req.params.schoolId,
      });
      updates.forEach((update) => {
        school[update] = req.body[update];
      });
      await school.save();

      return res.status(200).json({
        status: "success",
        data: { school },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Updating profile",
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
        { logo: req.file.location },
        { new: true }
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
        data: { school },
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
        { coverPhoto: req.file.location },
        { new: true }
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
        data: { school },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Update profile",
      });
    }
  }
}
export default AuthController;
