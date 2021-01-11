import Course from '../db/models/courses.model';
import Subject from '../db/models/subjects.model';
import EnrolledCourse from '../db/models/enrolledCourses.model';
import MainSubject from '../db/models/mainSubjects.model';
import SubjectProgress from '../db/models/subjectProgresses.model';
import QuizResult from '../db/models/quizResults.model';
/**
 *Contains Course Controller
 *
 *
 *
 * @class CourseController
 */
class CourseController {
  /**
   * Get all Cousres
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CourseController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async loadCourses(req, res) {
    try {
      const courses = await Course.find({});

      return res.status(200).json({
        status: 'success',
        data: {
          courses,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading courses',
      });
    }
  }

  /**
   * User Add a Cousre to list of their EnrolledCourse
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CourseController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addCourseToEnrolledCourses(req, res) {
    try {
      const course = await EnrolledCourse.create({
        userId: req.data.id,
        courseId: req.body.courseId,
      });
      await Course.findOneAndUpdate(
        { _id: req.body.courseId },
        { $inc: { enrollee: 1 } },
      );
      await course
        .populate({ path: 'courseId', select: 'name imageUrl' })
        .execPopulate();

      return res.status(200).json({
        status: 'success',
        data: {
          course,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading course',
      });
    }
  }

  /**
   * Get a Cousre
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CourseController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getCourse(req, res) {
    try {
      const course = await Course.findById(req.params.courseId);
      return res.status(200).json({
        status: 'success',
        data: {
          course,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading course',
      });
    }
  }

  /**
   * Get progress and performance for a Cousre
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CourseController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getCourseProgressAndPerformance(req, res) {
    try {
      const subjects = await Subject.find({
        courseId: req.params.courseId,
      }).populate({
        path: 'mainSubjectId',
        select: 'name imageUrl classification -_id',
        model: MainSubject,
      });
      const subjectsList = [];
      for (let index = 0; index < subjects.length; index++) {
        const subject = subjects[index];

        /* progress */
        const subjectProgressData = {
          userId: req.data.id,
          courseId: req.params.courseId,
          subjectId: subject._id,
        };
        if (req.body.classId) {
          subjectProgressData.classId = req.body.classId;
        }
        const subjectProgress = await SubjectProgress.find(
          subjectProgressData,
        ).countDocuments();
        /* progress */

        /* performance */
        const resultCondition = {
          courseId: '5fc8d2a4b55ab52a40d75a54',
          subjectId: '5fd304b5a3181bf4ca54f89c',
        };
        if (req.body.classId) {
          resultCondition.classId = req.body.classId;
        }
        const results = await QuizResult.find(resultCondition);
        let totalScore = 0;
        let totalQuestionsCorrect = 0;
        let totalQuestions = 0;
        let totalTimeSpent = 0;
        results.forEach((result) => {
          totalScore += result.score;
          totalQuestionsCorrect += result.numberOfCorrectAnswers;
          totalQuestions
            += result.numberOfCorrectAnswers
            + result.numberOfWrongAnswers
            + result.numberOfSkippedQuestions;
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

      return res.status(200).json({
        status: 'success',
        data: {
          subjectsList,
          remark: 'a function of performance',
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading course',
      });
    }
  }

  /**
   * Get all Subjects for a course
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof SubjectController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getSubjectsForACourse(req, res) {
    try {
      const subjects = await Subject.find({
        courseId: req.params.courseId,
      }).populate({
        path: 'mainSubjectId',
        select: 'name imageUrl classification -_id',
        model: MainSubject,
      });
      return res.status(200).json({
        status: 'success',
        data: {
          subjects,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading subjects',
      });
    }
  }

  /**
   * Submit subject progress
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof SubjectController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async subjectProgress(req, res) {
    try {
      const progress = await SubjectProgress.create(req.body);
      return res.status(201).json({
        status: 'success',
        data: {
          progress,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error submitting progress',
      });
    }
  }
}
export default CourseController;
