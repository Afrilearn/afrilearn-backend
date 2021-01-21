import Announcement from '../db/models/announcement.model';
import ClassModel from '../db/models/classes.model';
import ClassMember from '../db/models/classMembers.model';
import Comment from '../db/models/comment.model';
import CommentForAssignedContent from '../db/models/commentForAssignedContent.model';
import TeacherAssignedContent from '../db/models/teacherAssignedContents.model';
import User from '../db/models/users.model';
import sendEmail from '../utils/email.utils';
import Helper from '../utils/user.utils';

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
      const existingClassCode = await ClassModel.findOne({ classCode });

      if (existingClassCode) {
        classCode = await Helper.generateCode(8);
      }
      const classData = {
        courseId: req.body.courseId,
        userId: req.data.id,
        name: req.body.name,
        classCode,
      };
      const newClass = await ClassModel.create({ ...classData });

      return res.status(200).json({
        status: 'success',
        data: {
          class: newClass,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Adding class',
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
      const clazz = await ClassModel.findOne({ classCode: req.body.classCode });
      if (!clazz) {
        return res.status(404).json({
          status: '404 not found',
          error: 'Class not found',
        });
      }
      const classMemberData = {
        classId: clazz._id,
        userId: req.data.id,
      };
      if (Object.keys(req.body).includes('status')) {
        classMemberData.status = req.body.status;
      }
      const classMember = await ClassMember.create({ ...classMemberData });

      return res.status(200).json({
        status: 'success',
        data: {
          message:
            'Your class request was sent, wait for teacher to let you in',
          classMember,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error creating class request',
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
      const message = `Click this link to join the class ${req.body.link}`;
      sendEmail(req.body.email, 'Class Invite', message);
      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Your class Invite was sent to your email',
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error creating class request',
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
    try {
      const existingClassMember = await ClassMember.findOne({
        classId: req.params.classId,
        userId: req.data.id,
      });
      if (existingClassMember) {
        return res.status(400).json({
          status: '400 Bad request',
          error: 'Classmember already exist',
        });
      }
      const classMember = await ClassMember.create({
        classId: req.params.classId,
        userId: req.data.id,
        status: 'approved',
      });

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Your class request was approved.',
          classMember,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error creating class request',
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
        { ...classMemberData },
        { status: req.body.status },
        {
          new: true,
        },
      );

      return res.status(200).json({
        status: 'success',
        data: {
          classMember,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Upadating request status',
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
        .select('userId -_id')
        .populate('userId', 'fullName');

      return res.status(200).json({
        status: 'success',
        data: {
          classMembers,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error getting student list',
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
          path: 'relatedSubjects relatedPastQuestions userId courseId',
          populate: {
            path: 'mainSubjectId relatedLessons pastQuestionTypeId',
            populate: 'questions',
          },
        })
        .populate({
          path: 'classAnnouncements',
          populate: { path: 'comments teacher', populate: 'student' },
        })
        .populate({
          path: 'teacherAssignedContents',
          populate: [
            { path: 'teacher', model: User },
            { path: 'subjectId', populate: 'mainSubjectId' },
            { path: 'comments', populate: 'sender' },
          ],
        });
      const classMembers = await ClassMember.find({
        classId: req.params.classId,
      })
        .populate('userId')
        .select('status userId fullName email role');

      return res.status(200).json({
        status: 'success',
        data: {
          class: clazz,
          classMembers,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading class',
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
        status: 'success',
        data: {
          classes,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading class',
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
      const content = await TeacherAssignedContent.create({
        teacher: req.data.id,
        classId: req.params.classId,
        description: req.body.description,
        lessonId: req.body.lessonId,
        subjectId: req.body.subjectId,
        dueDate: req.body.dueDate,
      });
      return res.status(200).json({
        status: 'success',
        data: {
          content,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Assigning content',
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
      return res.status(201).json({
        status: 'success',
        data: {
          announcement,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error creating announcement',
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
        status: 'success',
        data: {
          comment,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error creating comment',
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
        status: 'success',
        data: {
          comment,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error creating comment',
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
        .populate({
          path: 'comments',
          model: Comment,
          populate: { path: 'student' },
        })
        .populate('teacher');
      return res.status(200).json({
        status: 'success',
        data: {
          announcements,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error getting announcements',
      });
    }
  }
}
export default ClassController;
