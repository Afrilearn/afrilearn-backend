import Subject from "../db/models/subjects.model";
import MainSubject from "../db/models/mainSubjects.model";
import Lesson from "../db/models/lessons.model";
import RelatedPastQuestion from "../db/models/relatedPastQuestions.model";

/**
 *Contains Course Controller
 *
 *
 *
 * @class ThirdPartyController
 */
class ThirdPartyController {
  /**
   * Get all Juniour secondary school course subjects
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof SubjectController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getJuniourSecondarySchoolClassSubjects(req, res) {
    try {
      const subjects = await Subject.find({
        $or: [{
          courseId: '5fff72b3de0bdb47f826feaf'
        }, {
          courseId: '5fff7329de0bdb47f826feb0'
        }, {
          courseId: '5fff734ade0bdb47f826feb1'
        }]
      }).populate({
        path: "mainSubjectId",
        select: "name",
        model: MainSubject,
      }).populate({
        path: "courseId",
        select: "name"
      });

      const relatedPastQuestions = await RelatedPastQuestion.find({
        $or: [{
          courseId: '5fff72b3de0bdb47f826feaf'
        }, {
          courseId: '5fff7329de0bdb47f826feb0'
        }, {
          courseId: '5fff734ade0bdb47f826feb1'
        }]
      })
      .select("pastQuestionTypeId")
      .populate({
        path: "pastQuestionTypeId",
        select: "name categoryId"
      });
      return res.status(200).json({
        status: "success",
        data: {
          subjects,
          relatedPastQuestions
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading subjects",
      });
    }
  }

  /**
   * get the lessons for a subject
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getSubjectLessons(req, res) {
    try {
      const lessons = await Lesson.find({
        subjectId: req.params.subjectId,
      }, {
        title: 1,
        content: 1,
        videoUrls:1
      }).populate({
        path: "questions",
        select:"options question question_image question_position correct_option explanation"       
      });;
      return res.status(200).json({
        status: "success",
        data: {
          lessons
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading lessons",
      });
    }
  }
}
export default ThirdPartyController;