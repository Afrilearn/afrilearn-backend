import AdminRole from "../db/models/adminRole.model";
import ClassModel from "../db/models/classes.model";
import User from "../db/models/users.model";
import Helper from "../utils/user.utils";
import sendEmail from "../utils/email.utils";
import StudentRequest from "../db/models/studentRequest.model";
import sendWhatsappMessge from "../utils/whatsapp.utils";
import Subject from "../db/models/subjects.model";
import Course from "../db/models/courses.model";
import EnrolledCOurse from "../db/models/enrolledCourses.model";
import mongoose from "mongoose";

/**
 *Contains StudentRequest Controller
 *
 *
 *
 * @class StudentRequestController
 */
class StudentRequestController {
  /**
   * Add an Admin to a class
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof StudentRequestController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addStudentRequest(req, res) {
    let attachment = "";
    if (req.file) {
      attachment = req.file.location;
    }
    try {
      const data = {
        ...req.body,
        userId: req.data.id,
        attachment,
      };
      //if subjectId and courseId are objectIds
      if (mongoose.isValidObjectId(req.body.subjectId)) {
        const subject = await Subject.findById(req.body.subjectId).populate(
          "mainSubjectId"
        );
        data.subjectId = subject.mainSubjectId.name;
      } else {
        data.subjectId = req.body.subjectId;
      }
      if (mongoose.isValidObjectId(req.body.courseId)) {
        const course = await Course.findById(req.body.courseId);
        data.courseId = course.name;
      } else {
        data.courseId = req.body.courseId;
      }
      const request = await StudentRequest.create({ ...data });
      const user = await User.findById(req.data.id);

      // Send Whatsapp message to admin (a request was received)
      // Send Whatsapp message to user (we received your request)
      const body = `Hello Afrilearn, I am ${user.fullName} \nPlease help me with this Question. \nQuestion: ${req.body.question} \nSubject: ${data.subjectId} \nClass: ${data.courseId}  \nEmail: ${req.body.email}  \nPhone: ${req.body.phone} `;
      sendWhatsappMessge(body);
      if (attachment) {
        sendWhatsappMessge(body, attachment);
      }

      // Send an email to admin (a request was received)
      // Send an email to user (we received your request)
      const htmlMessage = `
      <html>
      <head>
        <title></title>
        <link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
      </head>
      <body>
        <div>Hello Afrilearn, I am ${user.fullName} ,</div>
        <div>Please help me with this Question.</div>
        <div>Question: ${req.body.question}</div>
        <div>Subject: ${data.subjectId}</div>
        <div>Class: ${data.courseId}</div>
        <div>Email: ${req.body.email}</div>
        <div>Phone: ${req.body.phone} </div>
        ${
          attachment &&
          `<div>Attachment: <a href="${attachment}">Download</a></div>`
        }
        
        
      </body>
      </html>

      `;
      const userHtmlMessage = `
      <html>
      <head>
        <title></title>
        <link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
      </head>
      <body>
        <div>Dear ${user.fullName},</div>
        <br/ >
        <div>
        Thank you for posting your Assignment for help on Afrilearn. Our experienced Tutors are glad to receive your entry, excited to help and will get on it shortly.
        </div>
        <br/ >
        <div>
        Please expect to receive the Solution and Explanation to your assignment within the next 24 Hours. Should you have further questions, feel free to reach out to us as we are always at your service.
        </div>
       <br/ >
        <div>To your Success, </div>
       <br/ >
       <div>Team Afrilearn </div>             
      </body>
      </html>
      `;
      sendEmail(
        req.body.email,
        "Assignment Help Request Received!",
        userHtmlMessage
      );
      sendEmail(
        "care@myafrilearn.com, adebiyivictoria4@gmail.com, legend@myafrilearn.com",
        " HOMEWORK ASSISTANCE",
        htmlMessage
      );
      // care@myafrilearn.com
      return res.status(200).json({
        status: "success",
        data: { request },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding Student Request",
      });
    }
  }

  /**
   * clear enrolled courses with no user
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof StudentRequestController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async clearEnrolledC(req, res) {
    try {
      const users = await User.find({}).populate("enrolledCourses");
      const counts = [];
      const nulls = [];
      const parents = [];
      const schools = [];
      const googleSignIns = [];
      const students = [];
      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        // const enrolledCoursesCount = await EnrolledCOurse.countDocuments({
        //   userId: user._id,
        // });
        if (user.enrolledCourses.length < 1) {
          if (user.role == "606ed82e70f40e18e029165e") {
            parents.push(user);
          }
          if (user.role == "607ededa2712163504210684") {
            schools.push(user);
          }
          if (user.role == "5fd08fba50964811309722d5") {
            students.push(user);
            // await EnrolledCOurse.create({
            //   courseId: "5fff72b3de0bdb47f826feaf",
            //   userId: user._id,
            // });
          }
          if (
            user.role !== "5fd08fba50964811309722d5" &&
            user.role !== "607ededa2712163504210684" &&
            user.role !== "606ed82e70f40e18e029165e"
          ) {
            if (user.googleUserId) {
              googleSignIns.push(user);
            } else {
              nulls.push(user);
            }
          }
          // counts.push(enrolledCoursesCount);
          // await enrolledCOurse.remove();
        }
      }
      console.log("nulls", nulls.length);
      console.log("parents", parents.length);
      console.log("schools", schools.length);
      console.log("students", students.length);
      console.log("googleSignIns", googleSignIns.length);

      return res.status(200).json({
        status: "success",
        data: { nulls, parents, schools, students, googleSignIns },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding Student Request",
      });
    }
  }
}
export default StudentRequestController;
