import ClassMember from "../db/models/classMembers.model";
import EnrolledCourse from "../db/models/enrolledCourses.model";
import QuizResult from "../db/models/quizResults.model";
import RecentActivity from "../db/models/recentActivities.model";
import Recommendation from "../db/models/recommendation.model";
import SubjectProgress from "../db/models/subjectProgresses.model";
/**
 *Contains Dashboard Controller
 *
 *
 *
 * @class DashboardController
 */
class DashboardController {
  /**
   * Get a user's dashboard
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof DashboardController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getUserDashboard(req, res) {
    try {
      const classMembership = await ClassMember.find({
        userId: req.data.id,
      }).populate({ path: "classId userId", populate: "userId" });
      const recentActivities = await RecentActivity.find({
        userId: req.data.id,
      })
        .sort({ createdAt: -1 })
        .populate({
          path: "lessonId",
          select: "title subjectId",
          populate: {
            path: "subjectId",
            populate: "mainSubjectId",
          },
        });
      const recommendation = await Recommendation.find({
        userId: req.data.id,
      })
        .sort({ createdAt: -1 })
        .populate({
          path: "reason",
          select: "title",
          populate: { path: "_id" },
        })
        .populate({
          path: "recommended",
          select: "title videoUrls subjectId courseId",
          populate: {
            path: "_id subjectId courseId",
            populate: "mainSubjectId",
          },
        });
      const data = {
        classMembership,
        recentActivities,
        recommendation,
      };
      if (req.body.enrolledCourseId) {
        const enrolledCourse = await EnrolledCourse.findOne({
          _id: req.body.enrolledCourseId,
          userId: req.data.id,
        }).populate({
          path: "courseId",
          populate: {
            path: "relatedPastQuestions relatedSubjects",
            populate: {
              path:
                "pastQuestionTypes mainSubjectId quizResults relatedLessons",
            },
          },
        });
        const subjectsList = [];
        if (enrolledCourse) {
          for (
            let index = 0;
            index < enrolledCourse.courseId.relatedSubjects.length;
            index++
          ) {
            const subject = enrolledCourse.courseId.relatedSubjects[index];

            /* progress */
            const subjectProgressData = {
              userId: req.data.id,
              courseId: enrolledCourse.courseId._id,
              subjectId: subject._id,
            };
            const subjectProgress = await SubjectProgress.find(
              subjectProgressData
            ).countDocuments();
            /* progress */

            /* performance */
            const resultCondition = {
              userId: req.data.id,
              courseId: enrolledCourse.courseId._id,
              subjectId: subject._id,
            };
            const results = await QuizResult.find(resultCondition);
            let totalScore = 0;
            let totalQuestionsCorrect = 0;
            let totalQuestions = 0;
            let totalTimeSpent = 0;
            results.forEach((result) => {
              totalScore += result.score;
              totalQuestionsCorrect += result.numberOfCorrectAnswers;
              totalQuestions +=
                result.numberOfCorrectAnswers +
                result.numberOfWrongAnswers +
                result.numberOfSkippedQuestions;
              totalTimeSpent += result.timeSpent;
            });
            const performance = totalScore / results.length;
            const averageTimePerTest = totalTimeSpent / results.length;
            /* performance */

            subjectsList.push({
              subject: subject.mainSubjectId.name,
              performance,
              progress: subjectProgress,
              totalQuestionsCorrect,
              totalQuestions,
              averageTimePerTest,
            });
          }
          data.enrolledCourse = enrolledCourse;
          data.subjectsList = subjectsList;
        }
      }

      return res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading Dashboard",
      });
    }
  }

  /**
   * Get a user's dashboard on web
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof DashboardController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getUserDashboardWebVersion(req, res) {
    try {
      const data = {};
      if (req.body.enrolledCourseId) {
        const enrolledCourse = await EnrolledCourse.findOne({
          _id: req.body.enrolledCourseId,
          userId: req.data.id,
        })
          .select("courseId paymentIsActive")
          .populate({
            path: "courseId",
            select: "name alias imageUrl categoryId",
            populate: {
              path: "relatedPastQuestions relatedSubjects",
              populate: {
                path: "pastQuestionTypes mainSubjectId relatedLessons",
                select: "name imageUrl title videoUrls categoryId",
              },
            },
          });

        data.enrolledCourse = enrolledCourse;
      }

      return res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading Dashboard",
      });
    }
  }

  /**
   * Get a user's classMembership
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof DashboardController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getUserDashboardClassMembership(req, res) {
    try {
      const classMembership = await ClassMember.find({
        userId: req.data.id,
      }).populate({
        path: "classId",
        populate: { path: "userId", select: "fullName" },
      });

      return res.status(200).json({
        status: "success",
        data: { classMembership },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading Dashboard ClassMembership",
      });
    }
  }

  /**
   * Get a user's recentActivities
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof DashboardController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getUserDashboardRecentActivities(req, res) {
    try {
      const recentActivities = await RecentActivity.find({
        userId: req.data.id,
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate({
          path: "lessonId",
          select: "title subjectId",
          populate: {
            path: "subjectId",
            populate: "mainSubjectId",
          },
        });

      return res.status(200).json({
        status: "success",
        data: { recentActivities },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading Dashboard recentActivities",
      });
    }
  }

  /**
   * Get a user's recentActivities time based
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof DashboardController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getUserDashboardRecentActivitiesTimeBased(req, res) {
    const { startDate, endDate } = req.body;
    try {
      const recentActivities = await RecentActivity.find({
        userId: req.body.userId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .sort({ createdAt: -1 })
        .populate({
          path: "lessonId",
          select: "title subjectId courseId",
          populate: {
            path: "subjectId",
            populate: { path: "mainSubjectId", select: "-introText" },
          },
        })
        .populate({
          path: "quizResults",
          model: QuizResult,
          select: "timeSpent score createdAt",
        });

      return res.status(200).json({
        status: "success",
        data: { recentActivities },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading Dashboard recentActivities",
      });
    }
  }

  /**
   * Get a user's recommendations
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof DashboardController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getUserDashboardRecommendations(req, res) {
    try {
      const recommendation = await Recommendation.find({
        userId: req.data.id,
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate({
          path: "reason",
          select: "title",
          populate: {
            path: "_id subjectId courseId",
            select:
              "subjectId courseId creatorId termId title videoUrl name title",
          },
        })
        .populate({
          path: "recommended",
          select: "title videoUrls",
          populate: {
            path: "_id subjectId courseId",
            select:
              "subjectId courseId creatorId termId title videoUrl name mainSubectId",
            populate: { path: "mainSubjectId", select: "name" },
          },
        });

      return res.status(200).json({
        status: "success",
        data: { recommendation },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading Dashboard recommendation",
      });
    }
  }

  /**
   * Get a user's enrolledCourses
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof DashboardController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getUserDashboardEnrolledCourses(req, res) {
    try {
      const enrolledCourse = await EnrolledCourse.findOne({
        _id: req.body.enrolledCourseId,
        userId: req.data.id,
      }).populate({
        path: "courseId",
        populate: {
          path: "relatedPastQuestions relatedSubjects",
          populate: {
            path: "pastQuestionTypes mainSubjectId",
          },
        },
      });

      return res.status(200).json({
        status: "success",
        data: { enrolledCourse },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading Dashboard EnrolledCourse",
      });
    }
  }

  /**
   * Get a student's performance summary
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof DashboardController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getStudentPerformanceSummary(req, res) {
    try {
      const enrolledCourse = await EnrolledCourse.findOne({
        _id: req.body.enrolledCourseId,
        userId: req.data.id,
      }).populate({
        path: "courseId",
        populate: {
          path: "relatedSubjects",
          populate: {
            path: "mainSubjectId",
            select: "name",
          },
        },
      });
      const subjectsList = [];
      if (enrolledCourse) {
        for (
          let index = 0;
          index < enrolledCourse.courseId.relatedSubjects.length;
          index++
        ) {
          const subject = enrolledCourse.courseId.relatedSubjects[index];

          /* progress */
          const subjectProgressData = {
            userId: req.data.id,
            courseId: enrolledCourse.courseId._id,
            subjectId: subject._id,
          };
          const subjectProgress = await SubjectProgress.find(
            subjectProgressData
          ).countDocuments();
          /* progress */

          /* performance */
          const resultCondition = {
            userId: req.data.id,
            courseId: enrolledCourse.courseId._id,
            subjectId: subject._id,
          };
          const results = await QuizResult.find(resultCondition);
          let totalScore = 0;
          let totalQuestionsCorrect = 0;
          let totalQuestions = 0;
          let totalTimeSpent = 0;
          results.forEach((result) => {
            totalScore += result.score;
            totalQuestionsCorrect += result.numberOfCorrectAnswers;
            totalQuestions +=
              result.numberOfCorrectAnswers +
              result.numberOfWrongAnswers +
              result.numberOfSkippedQuestions;
            totalTimeSpent += result.timeSpent;
          });
          const performance = totalScore / results.length;
          const averageTimePerTest = totalTimeSpent / results.length;
          /* performance */

          subjectsList.push({
            subject: subject.mainSubjectId.name,
            performance,
            progress: subjectProgress,
            totalQuestionsCorrect,
            totalQuestions,
            averageTimePerTest,
          });
        }
      }

      return res.status(200).json({
        status: "success",
        data: subjectsList,
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading Dashboard EnrolledCourse",
      });
    }
  }
}
export default DashboardController;
