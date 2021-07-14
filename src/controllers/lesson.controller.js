import Question from "../db/models/questions.model";
import QuizResult from "../db/models/quizResults.model";
import Lesson from "../db/models/lessons.model";
import Subject from "../db/models/subjects.model";
import EnrolledCourse from "../db/models/enrolledCourses.model";
import ResumePlaying from "../db/models/resumePlaying.model";
import Favourite from "../db/models/favourite.model";
import sendEmail from "../utils/email.utils";

/**
 *Contains Lesson Controller
 *
 *
 *
 * @class LessonController
 */
class LessonController {
  /**
   * Get test for a lesson
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async loadTest(req, res) {
    try {
      const questions = await Question.find({
        lessonId: req.params.lessonId,
      });
      return res.status(200).json({
        status: "success",
        data: {
          questions,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading questions",
      });
    }
  }

  /**
   * Get  lessons
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getAllLessons(req, res) {
    try {
      const lessons = await Lesson.find({})
        .select("-content -courseId -creatorId -termId -transcript -id")
        .populate({
          path: "subjectId",
          select: "mainSubjectId",
          populate: {
            path: "mainSubjectId",
            select: "name",
          },
        });
      return res.status(200).json({
        status: "success",
        data: {
          lessons,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading questions",
      });
    }
  }

  /**
   * Search for lessons title and details
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async searchLessons(req, res) {
    try {
      let result;
      const { keywords } = req.params;
      const searchQuery = new RegExp(`.*${keywords}.*`, "i");
      if (Object.keys(req.body).includes("details")) {
        result = await Lesson.find(
          {
            title: searchQuery,
          },
          {
            title: 1,
            content: 1,
          }
        )
          .limit(18)
          .populate({
            path: "subjectId courseId termId",
            select: "name",
            populate: {
              path: "mainSubjectId",
              select: "imageUrl",
            },
          });
      } else {
        result = await Lesson.find(
          {
            title: searchQuery,
          },
          {
            title: 1,
          }
        ).limit(18);
      }

      return res.status(200).json({
        status: "success",
        data: {
          result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error returning search result",
      });
    }
  }

  /**
   * Save test result
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async saveTestResult(req, res) {
    try {
      const results = [];

      req.body.results.forEach((result) => {
        results.push({
          questionId: result.questionId,
          optionSelected: result.optionSelected,
          correctOption: result.correctOption,
          status: result.status,
        });
      });
      const quizResultData = {
        results,
        userId: req.data.id,
        classId: req.body.classId,
        courseId: req.body.courseId,
        subjectId: req.body.subjectId,
        lessonId: req.params.lessonId,
        timeSpent: req.body.timeSpent,
        numberOfCorrectAnswers: req.body.numberOfCorrectAnswers,
        numberOfWrongAnswers: req.body.numberOfWrongAnswers,
        numberOfSkippedQuestions: req.body.numberOfSkippedQuestions,
        score: req.body.score,
        remark: req.body.remark,
      };
      const existingQuizResult = await QuizResult.findOneAndUpdate(
        {
          lessonId: req.params.lessonId,
          userId: req.data.id,
        },
        quizResultData,
        {
          new: true,
        }
      );
      if (existingQuizResult) {
        return res.status(200).json({
          status: "success",
          data: {
            results: existingQuizResult,
          },
        });
      }
      const quizResult = await QuizResult.create({
        ...quizResultData,
      });

      return res.status(200).json({
        status: "success",
        data: {
          results: quizResult,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error saving results",
      });
    }
  }

  /**
   * Get test result
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getTestResult(req, res) {
    try {
      let quizResult = await QuizResult.findOne({
        lessonId: req.params.lessonId,
        userId: req.data.id,
      });
      if (Object.keys(req.body).includes("classId")) {
        quizResult = await QuizResult.findOne({
          lessonId: req.params.lessonId,
          userId: req.data.id,
          classId: req.body.classId,
        });
      }
      if (!quizResult) {
        return res.status(404).json({
          status: "404 error not found",
          error: "Result not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          results: quizResult,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading tests",
      });
    }
  }

  /**
   * Get subject basic details
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getSubjectBasicDetails(req, res) {
    try {
      const subject = await Subject.findOne({
        _id: req.params.subjectId,
        courseId: req.params.courseId,
      }).populate({ path: "mainSubjectId courseId" });
      return res.status(200).json({
        status: "success",
        data: {
          subject,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Getting Subject",
      });
    }
  }

  /**
   * Get subject lessons
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getSubjectLessons(req, res) {
    try {
      const subject = await Subject.findOne({
        _id: req.params.subjectId,
        courseId: req.params.courseId,
      }).populate({
        path: "relatedLessons",
        populate: "questions",
      });
      return res.status(200).json({
        status: "success",
        data: {
          relatedLessons: subject.relatedLessons,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading lessons",
      });
    }
  }

  /**
   * Get subject progress
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getSubjectProgress(req, res) {
    try {
      const subject = await Subject.findOne({
        _id: req.params.subjectId,
        courseId: req.params.courseId,
      }).populate({
        path: "progresses",
      });
      return res.status(200).json({
        status: "success",
        data: {
          progresses: subject.progresses,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading progresses",
      });
    }
  }

  /**
   * Get users subscribed to a course
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getUsersSubscribedToACourse(req, res) {
    try {
      const numOfUsers = await EnrolledCourse.countDocuments({
        courseId: req.params.courseId,
      });
      return res.status(200).json({
        status: "success",
        data: {
          numOfUsers,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error counting users",
      });
    }
  }

  /**
   * Get subject lessons and progress
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getSubjectLessonsAndProgress(req, res) {
    try {
      const subject = await Subject.findOne({
        _id: req.params.subjectId,
        courseId: req.params.courseId,
      }).populate({
        path: "relatedLessons mainSubjectId courseId progresses",
        populate: "questions",
      });
      const numOfUsers = await EnrolledCourse.countDocuments({
        courseId: req.params.courseId,
      });
      return res.status(200).json({
        status: "success",
        data: {
          subject,
          numOfUsers,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading lessons",
      });
    }
  }

  /**
   * Update lesson
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async updateLesson(req, res) {
    try {
      const lesson = await Lesson.findOne({
        _id: req.params.lessonId,
      });
      const videoUrls = lesson.videoUrls;
      const incomingData = {};
      incomingData.transcript = req.body.transcript;
      incomingData.videoUrl = req.body.videoUrl;
      lesson.videoUrls = [...videoUrls, incomingData];
      lesson.save();

      return res.status(200).json({
        status: "success",
        data: {
          lesson,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading lessons",
      });
    }
  }

  /**
   * Get single lesson
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getSingleLesson(req, res) {
    try {
      const lesson = await Lesson.findOne(
        {
          _id: req.params.lessonId,
        },
        {
          title: 1,
          content: 1,
        }
      );
      return res.status(200).json({
        status: "success",
        data: {
          lesson,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading lessons",
      });
    }
  }

  /**
   * Store unfinished videos
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async storeUnFinishedVideos(req, res) {
    try {
      const { userId, courseId, subjectId, lessonId, termId } = req.body;
      const condition = {
        userId,
        courseId,
        subjectId,
        lessonId,
        termId,
      };

      let result = await ResumePlaying.findOne(condition);

      if (!result) {
        result = await ResumePlaying.create(req.body);
      } else {
        await ResumePlaying.findOneAndDelete(condition);
        result = await ResumePlaying.create(req.body);
      }

      return res.status(200).json({
        status: "success",
        data: {
          result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error setting resume playing",
      });
    }
  }

  /**
   * Clean up watched video
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async clearUnFinishedVideos(req, res) {
    try {
      const { userId, courseId, subjectId, lessonId, termId } = req.body;
      const condition = {
        userId,
        courseId,
        subjectId,
        lessonId,
        termId,
      };

      await ResumePlaying.findOneAndDelete(condition);

      return res.status(200).json({
        status: "success",
        data: {
          message: "Data delected successfully",
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error removing video from resume watching list",
      });
    }
  }

  /**
   * Save Favourite lesson video
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async saveFavouriteVideos(req, res) {
    try {
      let result = await Favourite.create(req.body);
      return res.status(200).json({
        status: "success",
        data: {
          result,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error saving favourite",
      });
    }
  }

  /**
   * remove from favourite
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async removeFromFavourite(req, res) {
    try {
      const { userId, courseId, subjectId, lessonId, termId } = req.body;
      const condition = {
        userId,
        courseId,
        subjectId,
        lessonId,
        termId,
      };

      await Favourite.findOneAndDelete(condition);

      return res.status(200).json({
        status: "success",
        data: {
          message: "Data delected successfully",
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error removing video from favourite",
      });
    }
  }

  /**
   * Save liked lesson video
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async saveLikedVideo(req, res) {
    try {
      const { userId, lessonId } = req.body;

      let selectedLesson = await Lesson.findById(lessonId);
      selectedLesson.likes = selectedLesson.likes.slice(); // Clone the tags array
      selectedLesson.likes.push(userId);
      selectedLesson.save();

      return res.status(200).json({
        status: "success",
        data: {
          selectedLesson,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error saving like",
      });
    }
  }

  /**
   * Remove liked lesson video
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async removeLikedVideo(req, res) {
    try {
      const { userId, lessonId } = req.body;

      let selectedLesson = await Lesson.findById(lessonId);
      selectedLesson.likes = selectedLesson.likes.slice(); // Clone the tags array
      selectedLesson.likes.pull(userId);
      selectedLesson.save();

      return res.status(200).json({
        status: "success",
        data: { selectedLesson },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error removing liked video",
      });
    }
  }
  /**
   * Report Lesson
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async reportLesson(req, res) {
    try {
      const { message } = req.body;
      sendEmail("hello@myafrilearn.com", "Flagged Lesson", message);
      return res.status(200).json({
        status: "success",
        data: {
          message: "Lesson reported successfully",
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error reporting lesson",
      });
    }
  }
}
export default LessonController;
