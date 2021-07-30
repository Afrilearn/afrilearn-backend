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
import axios from "axios";
import CourseCategory from "../db/models/courseCategories.model";
import Class from "../db/models/classes.model";
import AdminRole from "../db/models/adminRole.model";

/**
 *Contains Parent Controller
 *
 *
 *
 * @class ParentController
 */

class ParentController {
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

      const child = await Auth.findOne({
        email: email,
      });
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
   * Parent's list of children
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async populateParentDashboard(req, res) {
    try {
      const children = await Auth.find({
        parentId: req.data.id,
      }).populate({
        path: "enrolledCourses",
        // select: "courseId -userId",
        populate: {
          path: "courseId transaction",
          select: "name alias paymentPlanId",
          populate: {
            path: "paymentPlanId",
            select: "name",
          },
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
        data: {
          children,
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
      const existingParent = await Auth.findOne({
        _id: parentId,
      });
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

      const result = new Auth({
        ...newUser,
      });
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

      const existingParent = await Auth.findOne({
        _id: parentId,
      });
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

      // existingUser.parentId = parentId;
      // await existingUser.save();
      //send child request

      const message = `Hi, ${existingUser.fullName}, ${existingParent.fullName} is requesting to add you to their children list. \n Click this link to accept the request https://www.myafrilearn.com/accept-request?role=child&email=${email}&parentId=${parentId}`;
      const parentMessage = ` ${existingParent.fullName} your parent request was sent to ${existingUser.fullName} `;

      sendEmail(email, "Your parent sent you a request", message);
      sendEmail(
        existingParent.email,
        "Your parent request was sent",
        parentMessage
      );

      return res.status(200).json({
        status: "success",
        data: {
          message: "Your parent request was sent",
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
   * Accept Parent request.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async acceptParentReuest(req, res) {
    try {
      const { email, parentId } = req.body;
      const existingUser = await Auth.findOne({
        email: email,
      });
      const existingParent = await Auth.findOne({
        _id: parentId,
      });
      if (!existingParent) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Parent is not registered",
        });
      }

      if (!existingUser) {
        return res.status(404).json({
          status: "404 Bad request",
          error: "Your email is not registered",
        });
      }

      const existingParentChild = await Auth.findOne({
        email,
        parentId,
      });

      if (existingParentChild) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "You are already registered to this Parent",
        });
      }

      if (existingUser.parentId && existingUser.parentId !== parentId) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "You have been registered to another parent",
        });
      }

      existingUser.parentId = parentId;
      await existingUser.save();

      const message = `Hi, ${existingUser.fullName}, you have joined ${existingParent.fullName}'s children list.`;
      const parentMessage = ` ${existingParent.fullName} your parent request has been accepted by ${existingUser.fullName} `;

      sendEmail(email, "Congratulations! ", message);
      sendEmail(
        existingParent.email,
        "Your parent request was sent",
        parentMessage
      );

      return res.status(200).json({
        status: "success",
        data: {
          message: "Request accepted",
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

      const existingParent = await Auth.findOne({
        _id: parentId,
      });
      if (!existingParent) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Parent is not registered",
        });
      }
      //console.log(existingParent);

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
   * Parent unlink children account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async unlinkChildrenAccounts(req, res) {
    const { childrenIds, parentId } = req.body;
    try {
      const existingParent = await Auth.findOne({
        _id: parentId,
      });
      if (!existingParent) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Parent is not registered",
        });
      }
      let children = [];

      for (let index = 0; index < childrenIds.length; index++) {
        const userId = childrenIds[index];

        const existingParentChild = await Auth.findOne({
          _id: userId,
          parentId,
        });
        if (!existingParentChild) {
          const childDetail = await Auth.findOne({
            _id: userId,
          });
          let text = "some users";
          if (childDetail) {
            text = childDetail.email;
          }
          return res.status(400).json({
            status: "400 Bad request",
            error:
              "You have no parent relationship with " +
              text +
              ". Select only your children.",
          });
        }
      }
      for (let index = 0; index < childrenIds.length; index++) {
        const userId = childrenIds[index];

        const existingParentChild = await Auth.findOne({
          _id: userId,
          parentId,
        });

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

        children.push(existingParentChild);
      }

      // //console.log(existingParent);

      return res.status(200).json({
        status: "success",
        data: {
          users: children,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Unlinking users",
      });
    }
  }

  /**
   * Parent delete children accounts.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async deleteChildrenAccounts(req, res) {
    const { childrenIds, parentId } = req.body;
    try {
      const existingParent = await Auth.findOne({
        _id: parentId,
      });
      if (!existingParent) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Parent is not registered",
        });
      }

      let children = [];

      for (let index = 0; index < childrenIds.length; index++) {
        const userId = childrenIds[index];

        const existingParentChild = await Auth.findOne({
          _id: userId,
          parentId,
        });
        if (!existingParentChild) {
          const childDetail = await Auth.findOne({
            _id: userId,
          });
          let text = "some users";
          if (childDetail) {
            text = childDetail.email;
          }
          return res.status(400).json({
            status: "400 Bad request",
            error:
              "You have no parent relationship with " +
              text +
              ". Select only your children.",
          });
        }
      }

      for (let index = 0; index < childrenIds.length; index++) {
        const userId = childrenIds[index];

        const existingParentChild = await Auth.findOne({
          _id: userId,
          parentId,
        });

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

        children.push(existingParentChild);
      }

      return res.status(200).json({
        status: "success",
        data: {
          users: children,
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

      const existingParent = await Auth.findOne({
        _id: parentId,
      });
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
}

export default ParentController;
