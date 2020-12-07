import Course from "../db/models/courses.model";
import Subject from "../db/models/subjects.model";
import EnrolledCourse from "../db/models/enrolledCourses.model";
import mainSubject from "../db/models/mainSubjects.model";
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
        status: "success",
        data: {
          courses,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading courses",
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
      const course = new EnrolledCourse({
        userId: req.data.id,
        courseId: req.body.courseId,
      });
      await course.save();
      await course
        .populate({ path: "courseId", select: "name" })
        .execPopulate();

      return res.status(200).json({
        status: "success",
        data: {
          course,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading course",
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
        status: "success",
        data: {
          course,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading course",
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
        path: "mainSubjectId",
        select: "name",
        model: mainSubject,
      });
      return res.status(200).json({
        status: "success",
        data: {
          subjects,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading subjects",
      });
    }
  }
}
export default CourseController;
