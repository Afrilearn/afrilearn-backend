import AdminRole from "../db/models/adminRole.model";
import Announcement from "../db/models/announcement.model";
import Class from "../db/models/classes.model";
import ClassModel from "../db/models/classes.model";
import ClassMember from "../db/models/classMembers.model";
import Comment from "../db/models/comment.model";
import CommentForAssignedContent from "../db/models/commentForAssignedContent.model";
import Lesson from "../db/models/lessons.model";
import Subject from "../db/models/subjects.model";
import TeacherAssignedContent from "../db/models/teacherAssignedContents.model";
import User from "../db/models/users.model";
import School from "../db/models/schoolProfile";
import sendEmail from "../utils/email.utils";
import Helper from "../utils/user.utils";

/**
 *Contains Class Controller
 *
 *
 *
 * @class ClassController
 */
class ClassController {
  /**
   * Add a Class
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addClass(req, res) {
    let classCode = await Helper.generateCode(8);
    try {
      const existingClassCode = await ClassModel.findOne({
        classCode,
      });

      if (existingClassCode) {
        classCode = await Helper.generateCode(9);
      }
      const classData = {
        courseId: req.body.courseId,
        userId: req.data.id,
        name: req.body.name,
        classCode,
      };
      if (req.body.schoolId) {
        classData.schoolId = req.body.schoolId;
      }
      const newClass = await ClassModel.create({
        ...classData,
      });

      return res.status(200).json({
        status: "success",
        data: {
          class: newClass,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding class",
      });
    }
  }

  /**
   * Delete a Class
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async deleteClass(req, res) {
    try {
      const newClass = await ClassModel.findByIdAndRemove(req.params.classId);
      return res.status(200).json({
        status: "success",
        data: {
          class: newClass,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Removing class",
      });
    }
  }

  /**
   * Update a Class Name
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async updateClassName(req, res) {
    try {
      const existingClass = await ClassModel.findByIdAndUpdate(
        req.params.classId,
        {
          name: req.body.name,
        },
        {
          new: true,
        }
      );
      if (!existingClass) {
        return res.status(404).json({
          status: "404 not found",
          error: "Class not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          class: existingClass,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Removing class",
      });
    }
  }

  /**
   * Student send a Class request
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async sendClassRequest(req, res) {
    try {
      const clazz = await ClassModel.findOne({
        classCode: req.body.classCode,
      });
      if (!clazz) {
        return res.status(404).json({
          status: "404 not found",
          error: "Class not found",
        });
      }
      const classMemberData = {
        classId: clazz._id,
        userId: req.data.id,
      };
      if (Object.keys(req.body).includes("status")) {
        classMemberData.status = req.body.status;
      }
      const existingClassMember = await ClassMember.findOne({
        ...classMemberData,
      });
      if (existingClassMember) {
        return res.status(400).json({
          status: "400 not found",
          error: "You are already a member of this class",
        });
      }
      const classMember = await ClassMember.create({
        ...classMemberData,
      });

      return res.status(200).json({
        status: "success",
        data: {
          message:
            "Your class request was sent, wait for teacher to let you in",
          classMember,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating class request",
      });
    }
  }

  /**
   * send a Class invite by Email
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async sendClassEmailInvite(req, res) {
    try {
      const fullName = req.data.fullName;
      const message = `
      Congratulations! <br/>
      
      Your friend, ${fullName}, is inviting you to enjoy engaging video lessons, class notes, practice tests, live classes for best results in WASSCE, NECO, BECE, UTME, POST-UTME & more. Simply download the fun Afrilearn App or visit https://myafrilearn.com/ now. <br/>
      
      Afrilearn transforms average students and outright failures into high flying students and highly successful people. <br/>
      
      Download the fun Afrilearn App or visit https://myafrilearn.com/ now.
      <br/>
      
      Cheers to Academic Excellence! 
      <br/>
      Click this link to join the class ${req.body.link}`;
      sendEmail(req.body.email, "Become A High-Flying Student!", message);
      return res.status(200).json({
        status: "success",
        data: {
          message: "Your class Invite was sent to your email",
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating class request",
      });
    }
  }

  /**
   * Student send a Class request(approved)
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async joinClassApproved(req, res) {
    // user lands on join class page with email and classid
    // if user exists
    // yes? add user to class
    // no? collect Name, create account and add to class

    try {
      // user lands on join class page with email and classid
      // if user exists
      const user = await User.findOne({
        email: req.body.email,
      });

      // yes? add user to class
      if (user) {
        const existingClassMember = await ClassMember.findOne({
          classId: req.params.classId,
          userId: user._id,
        });
        if (existingClassMember) {
          return res.status(400).json({
            status: "400 Bad request",
            error:
              "Classmember already exist. Access your classes on your dashboard",
          });
        }
        const classMember = await ClassMember.create({
          classId: req.params.classId,
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
      } else {
        // no? collect Name, create account and add to class
        const user = await User.create({
          email: req.body.email,
          fullName: req.body.fullName,
          password: req.body.password,
          role: "5fd08fba50964811309722d5",
        });
        const classMember = await ClassMember.create({
          classId: req.params.classId,
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
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating class request",
      });
    }
  }

  /**
   * Teacher accept/reject/retract a Class request
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async acceptRejectRetractClassRequest(req, res) {
    try {
      const classMemberData = {
        classId: req.body.classId,
        userId: req.body.userId,
      };
      const classMember = await ClassMember.findOneAndUpdate(
        {
          ...classMemberData,
        },
        {
          status: req.body.status,
        },
        {
          new: true,
        }
      );
      if (!classMember) {
        return res.status(404).json({
          status: "404 not found",
          error: "Classmember not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          classMember,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Upadating request status",
      });
    }
  }

  /**
   * Get list of students in a class
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getStudentsInClass(req, res) {
    try {
      const classMembers = await ClassMember.find({
        classId: req.params.classId,
      })
        .select("userId -_id")
        .populate({
          path: "userId",
          select: "fullName email",
        });
      const teacher = await Class.findOne({
        _id: req.params.classId,
      }).populate({
        path: "userId",
        populate: "role",
      });
      const admins = await AdminRole.find({
        classId: req.params.classId,
      })
        .select("userId roleDescription")
        .populate({
          path: "userId",
          select: "-password -schoolId",
          populate: "role",
        });

      const teacherPlusAdmins = [...admins];
      if (teacher.userId) {
        teacherPlusAdmins.push({
          _id: teacher.userId._id,
          roleDescription: "Teacher",
          userId: teacher.userId,
        });
      }
      return res.status(200).json({
        status: "success",
        data: {
          classMembers,
          admins: teacherPlusAdmins,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting student list",
      });
    }
  }

  /**
   * Get a class by ID
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getClassById(req, res) {
    try {
      // if classmember with userId, and classId exist, allow, else deny
      const clazz = await ClassModel.findById(req.params.classId)
        .populate({
          path: "schoolId",
          model: School,
        })
        .populate({
          path:
            "relatedSubjects relatedPastQuestions userId courseId enrolledCourse", //can remove relatedLessons
          populate: {
            path: "mainSubjectId relatedLessons pastQuestionTypeId",
            populate: "questions",
          },
        })
        .populate({
          path: "classAnnouncements",
          populate: {
            path: "comments teacher",
            populate: "student",
          },
          model: Announcement,
          sort: ["createdAt", 1],
        })
        .populate({
          path: "teacherAssignedContents",
          populate: [
            {
              path: "teacher",
              model: User,
            },
            {
              path: "subjectId",
              populate: "mainSubjectId courseId",
            },
            {
              path: "comments",
              populate: "sender",
            },
            {
              path: "lessonId",
              model: Lesson,
            },
            {
              path: "userId",
              model: User,
            },
          ],
        });
      const classMembers = await ClassMember.find({
        classId: req.params.classId,
      })
        .populate("userId")
        .select("status userId fullName email role");

      return res.status(200).json({
        status: "success",
        data: {
          class: clazz,
          classMembers,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading class",
      });
    }
  }

  /**
   * Get a class by ID
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getClassByIdMobile(req, res) {
    try {
      // if classmember with userId, and classId exist, allow, else deny
      const clazz = await ClassModel.findById(req.params.classId)
        .populate({
          path: "schoolId",
          model: School,
        })
        .populate({
          path: "userId", //can remove relatedLessons
          select: "fullName email",
        })
        .populate({
          path: "courseId", //can remove relatedLessons
          select: "name alias imageUrl enrollee subjects",
        })
        .populate({
          path: "enrolledCourse", //can remove relatedLessons
        })
        .populate({
          path: "relatedSubjects", //can remove relatedLessons
          populate: {
            path: "mainSubjectId",
            select: "name imageUrl",
          },
        })
        .populate({
          path: "relatedPastQuestions", //can remove relatedLessons
          populate: {
            path: "pastQuestionTypeId",
          },
        });
      const classMembers = await ClassMember.find({
        classId: req.params.classId,
      })
        .populate("userId")
        .select("status userId fullName email role");

      return res.status(200).json({
        status: "success",
        data: {
          class: clazz,
          classMembers,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading class",
      });
    }
  }

  /**
   * Get classes
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getClasses(req, res) {
    try {
      const classes = await ClassModel.find({});

      return res.status(200).json({
        status: "success",
        data: {
          classes,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading class",
      });
    }
  }

  /**
   * Teacher Assign Content to Student
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async assignContent(req, res) {
    try {
      const lessons = await Lesson.find({
        _id: {
          $in: req.body.lessonIds,
        },
      });
      const createdContents = [];
      for (let index = 0; index < lessons.length; index++) {
        const lesson = lessons[index];
        const assignedContentData = {
          teacher: req.data.id,
          classId: req.params.classId,
          description: req.body.description,
          lessonId: lesson._id,
          subjectId: lesson.subjectId,
          dueDate: req.body.dueDate,
        };

        if (req.body.audience === "all") {
          assignedContentData.audience = "all";
          const contentOne = await TeacherAssignedContent.create(
            assignedContentData
          );
          const content = await TeacherAssignedContent.findOne({
            _id: contentOne._id,
          })
            .populate({
              path: "teacher userId",
              model: User,
              select: "role email fullName",
            })
            .populate({
              path: "subjectId",
              select: "mainSubjectId",
              populate: { path: "mainSubjectId", select: "name" },
            });
          createdContents.push(content);
        } else if (
          req.body.audience !== "all" &&
          Array.isArray(req.body.userIds)
        ) {
          for (let index = 0; index < req.body.userIds.length; index++) {
            const userId = req.body.userIds[index];
            assignedContentData.userId = userId;
            const contentOne = await TeacherAssignedContent.create(
              assignedContentData
            );
            const content = await TeacherAssignedContent.findOne({
              _id: contentOne._id,
            }).populate({
              path: "teacher userId",
              model: User,
              select: "role email fullName",
            });
            // await content.execPopulate();
            createdContents.push(content);
          }
        }
      }
      return res.status(200).json({
        status: "success",
        data: {
          createdContents,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Assigning content",
      });
    }
  }

  /**
   * Teacher Delete Assigned Content
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async deleteAssignContent(req, res) {
    try {
      const createdContent = await TeacherAssignedContent.findOneAndDelete({
        _id: req.params.classworkId,
      });
      return res.status(200).json({
        status: "success",
        data: {
          createdContent,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Deleting Assigned content",
      });
    }
  }

  /**
   * Teacher make announcement to Student
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async makeAnnouncement(req, res) {
    try {
      const announcement = await Announcement.create({
        teacher: req.data.id,
        classId: req.params.classId,
        text: req.body.text,
      });

      const newData = await Announcement.findOne({ _id: announcement._id })
        .populate({
          path: "comments",
          model: Comment,
          populate: {
            path: "student",
            select: "fullName role",
          },
        })
        .populate({ path: "teacher", select: "fullName role" });

      return res.status(201).json({
        status: "success",
        data: {
          announcement: newData,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating announcement",
      });
    }
  }

  /**
   * comment on an announcement
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async makeComment(req, res) {
    try {
      const comment = await Comment.create({
        student: req.data.id,
        announcementId: req.params.announcementId,
        text: req.body.text,
      });
      return res.status(201).json({
        status: "success",
        data: {
          comment,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating comment",
      });
    }
  }

  /**
   * comment on an teacherAssignedContent
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async makeCommentOnAssignedContent(req, res) {
    try {
      const comment = await CommentForAssignedContent.create({
        student: req.body.student,
        sender: req.data.id,
        teacherAssignedContentId: req.params.teacherAssignedContentId,
        text: req.body.text,
      });
      return res.status(201).json({
        status: "success",
        data: {
          comment,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating comment",
      });
    }
  }

  /**
   * get class assigned contents
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getClassAssignedContents(req, res) {
    try {
      let searchData = {
        classId: req.params.classId,
      };
      if (req.body.userId) {
        searchData.userId = req.body.userId;
      }
      const assignedContents = await TeacherAssignedContent.find(searchData)
        .populate({
          path: "teacher",
          model: User,
          select: "fullName",
        })
        .populate({
          path: "lessonId",
          model: Lesson,
          select: "title",
        })
        .populate({
          path: "subjectId",
          model: Subject,
          select: "mainSubjectId",
          populate: {
            path: "mainSubjectId",
            select: "name",
          },
        });
      return res.status(200).json({
        status: "success",
        data: {
          assignedContents,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting assignedContents",
      });
    }
  }

  /**
   * get single assigned content
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getAssignedContent(req, res) {
    try {
      const assignedContent = await TeacherAssignedContent.findOne({
        _id: req.params.classworkId,
      })
        .select("teacher subjectId description dueDate createdAt")
        .populate({
          path: "teacher",
          model: User,
          select: "fullName",
        })
        .populate({
          path: "subjectId",
          model: Subject,
          select: "mainSubjectId",
          populate: {
            path: "mainSubjectId",
            select: "name",
          },
        })
        .populate({
          path: "comments",
          model: CommentForAssignedContent,
          select: "sender student text createdAt",
          populate: {
            path: "student sender",
            select: "fullName",
          },
        });
      return res.status(200).json({
        status: "success",
        data: {
          assignedContent,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting assignedContent",
      });
    }
  }

  /**
   * get class announcements
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ClassController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getClassAnnouncements(req, res) {
    try {
      const announcements = await Announcement.find({
        classId: req.params.classId,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: "comments",
          model: Comment,
          populate: {
            path: "student",
            select: "fullName role",
          },
        })
        .populate({ path: "teacher", select: "fullName role" });
      return res.status(200).json({
        status: "success",
        data: {
          announcements,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting announcements",
      });
    }
  }
}
export default ClassController;
