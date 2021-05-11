import axios from "axios";
import Course from "../db/models/courses.model";
import Subject from "../db/models/subjects.model";
import EnrolledCourse from "../db/models/enrolledCourses.model";
import MainSubject from "../db/models/mainSubjects.model";
import SubjectProgress from "../db/models/subjectProgresses.model";
import QuizResult from "../db/models/quizResults.model";
import PastQuestionProgress from "../db/models/pastQuestionProgresses.model";
import PastQuestionQuizResult from "../db/models/pastQuestionQuizResults.model";
import RelatedPastQuestion from "../db/models/relatedPastQuestions.model";
import PastQuestionType from "../db/models/pastQuestionTypes.model";
import Recommendation from "../db/models/recommendation.model";
import Lesson from "../db/models/lessons.model";
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
      const courses = await Course.find({})
        .populate({
          path: "relatedSubjects",
          populate: { path: "mainSubjectId relatedLessons" },
        })
        .sort({ categoryId: -1, _id: 1 });

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
      const existingEnrollement = await EnrolledCourse.findOne({
        userId: req.body.userId,
        courseId: req.body.courseId,
      });
      if (existingEnrollement) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "You are enrolled to this class",
        });
      }
      const course = await EnrolledCourse.create({
        userId: req.body.userId,
        courseId: req.body.courseId,
      });
      await course
        .populate({ path: "courseId", select: "name imageUrl" })
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
      const course = await Course.findById(req.params.courseId).populate({
        path: "relatedSubjects",
        populate: {
          path: "mainSubjectId relatedLessons",
          populate: { path: "questions" },
        },
      });
      const numOfUsers = await EnrolledCourse.countDocuments({
        courseId: req.params.courseId,
      });
      return res.status(200).json({
        status: "success",
        data: {
          course,
          numOfUsers,
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
   * Get progress and performance for a Cousre
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CourseController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getCourseProgressAndPerformance(req, res) {
    try {
      const userID = req.body.userId || req.data.id;
      console.log("userID", userID);
      const userWithThisPerformance = "Usman";
      if (req.body.classId) {
        // if req.body.classId
        /* pq */
        const relatedPq = await RelatedPastQuestion.find({
          courseId: req.params.courseId,
        }).populate({
          path: "pastQuestionTypes",
          select: "name categoryId",
          model: PastQuestionType,
        });
        const examsList = [];
        // relatedPq.forEach(pq => {

        // });
        for (let index = 0; index < relatedPq.length; index++) {
          const pq = relatedPq[index];

          for (let index = 0; index < pq.pastQuestionTypes.length; index++) {
            const item = pq.pastQuestionTypes[index];

            /* Total performance */
            const pastQuestionResultCondition = {
              userId: req.body.userId ? req.body.userId : req.data.id,
              courseId: req.params.courseId,
              pastQuestionCategoryId: item.categoryId,
              classId: req.body.classId,
            };
            const pastQuestionResults = await PastQuestionQuizResult.find(
              pastQuestionResultCondition
            );
            let pqTotalScore = 0;
            let totalTimeSpentOnQuestion = 0;
            pastQuestionResults.forEach((result) => {
              pqTotalScore += result.score;
              totalTimeSpentOnQuestion += parseInt(result.timeSpent, 10);
            });
            const pqPerformance = pqTotalScore / pastQuestionResults.length;
            const averageTimePerSubject =
              totalTimeSpentOnQuestion / pastQuestionResults.length;
            /* Total performance */

            /* progress */
            const { data: totalSubjects } = await axios.get(
              `https://api.exambly.com/adminpanel/v2/getMySubjects/${item.categoryId}`,
              {
                headers: {
                  "Content-type": "application/json",
                  authorization:
                    "F0c7ljTmi25e7LMIF0Wz01lZlkHX9b57DFTqUHFyWeVOlKAsKR0E5JdBOvdunpqv",
                },
              }
            );
            /* subjectIDs */
            const subjectIds = [];
            const perSubjectResults = [];
            if (totalSubjects.subjects) {
              totalSubjects.subjects.forEach((subject) => {
                const result = pastQuestionResults.find(
                  (rslt) => rslt.subjectCategoryId === parseInt(subject.id, 10)
                );
                perSubjectResults.push({
                  name: subject.subject,
                  score: result ? result.score : 0,
                });
              });
            }

            const pastQuestionProgressData = {
              userId: req.body.userId ? req.body.userId : req.data.id,
              courseId: req.params.courseId,
              pastQuestionCategoryId: item.categoryId,
              classId: req.body.classId,
            };
            const pqSubjectProgress = await PastQuestionProgress.find({
              ...pastQuestionProgressData,
            }).countDocuments();
            //   /* progress */
            const toPush = {
              name: item.name,
              exam_id: item.categoryId,
              performance: pqPerformance,
              averageTimePerSubject,
              subjectsAttempted: pqSubjectProgress,
              perSubjectResults,
            };
            if (totalSubjects.subjects) {
              toPush.totalSubjectsCount = totalSubjects.subjects.length;
            }
            examsList.push(toPush);
          }
        }
        /* pq */
        const subjects = await Subject.find({
          courseId: req.params.courseId,
        })
          .populate({
            path: "mainSubjectId",
            select: "name imageUrl classification -_id",
            model: MainSubject,
          })
          .populate({
            path: "relatedLessons",
          });
        const subjectsList = [];
        for (let index = 0; index < subjects.length; index++) {
          const subject = subjects[index];

          /* progress */
          const subjectProgressData = {
            userId: req.body.userId ? req.body.userId : req.data.id,
            courseId: req.params.courseId,
            subjectId: subject._id,
            classId: req.body.classId,
          };
          const incomingSubjectProgress = await SubjectProgress.find(
            subjectProgressData
          ).countDocuments();
          const subjectProgress =
            (incomingSubjectProgress / subject.relatedLessons.length) * 100;
          /* progress */

          /* performance */
          const resultCondition = {
            userId: req.body.userId ? req.body.userId : req.data.id,
            courseId: req.params.courseId,
            subjectId: subject._id,
            classId: req.body.classId,
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
            numberOfTests: results.length,
            totalTests: subject.relatedLessons.length,
          });
        }
        return res.status(200).json({
          status: "success",
          data: {
            subjectsList,
            examsList,
            status: "with class",
            user: userWithThisPerformance,
          },
        });
      }
      // no req.body.classId
      /* pq */

      const relatedPq = await RelatedPastQuestion.find({
        courseId: req.params.courseId,
      }).populate({
        path: "pastQuestionTypes",
        select: "name categoryId",
        model: PastQuestionType,
      });
      const examsList = [];
      for (let index = 0; index < relatedPq.length; index++) {
        const pq = relatedPq[index];

        for (let index = 0; index < pq.pastQuestionTypes.length; index++) {
          const item = pq.pastQuestionTypes[index];
          /* Total performance */
          const pastQuestionResultCondition = {
            userId: req.body.userId ? req.body.userId : req.data.id,
            courseId: req.params.courseId,
            pastQuestionCategoryId: item.categoryId,
          };

          const pastQuestionResults = await PastQuestionQuizResult.find(
            pastQuestionResultCondition
          );
          let pqTotalScore = 0;
          let totalTimeSpentOnQuestion = 0;
          pastQuestionResults.forEach((result) => {
            pqTotalScore += result.score;
            totalTimeSpentOnQuestion += parseInt(result.timeSpent, 10);
          });
          const pqPerformance = pqTotalScore / pastQuestionResults.length;
          const averageTimePerSubject =
            totalTimeSpentOnQuestion / pastQuestionResults.length;
          /* Total performance */
          /* progress */

          const response = await axios.get(
            `https://api.exambly.com/adminpanel/v2/getMySubjects/${item.categoryId}`,
            {
              headers: {
                "Content-type": "application/json",
                authorization:
                  "F0c7ljTmi25e7LMIF0Wz01lZlkHX9b57DFTqUHFyWeVOlKAsKR0E5JdBOvdunpqv",
              },
            }
          );
          const totalSubjects = response.data;
          /* subjectIDs */
          const subjectIds = [];
          const perSubjectResults = [];
          if (totalSubjects.subjects) {
            totalSubjects.subjects.forEach((subject) => {
              const result = pastQuestionResults.find(
                (rslt) => rslt.subjectCategoryId === parseInt(subject.id, 10)
              );
              perSubjectResults.push({
                name: subject.subject,
                score: result ? result.score : 0,
              });
            });
          }

          const pastQuestionProgressData = {
            userId: req.body.userId ? req.body.userId : req.data.id,
            courseId: req.params.courseId,
            pastQuestionCategoryId: item.categoryId,
            classId: null,
          };
          const pqSubjectProgress = await PastQuestionProgress.find({
            ...pastQuestionProgressData,
          }).countDocuments();
          //   /* progress */
          const dataToPush = {
            name: item.name,
            exam_id: item.categoryId,
            performance: pqPerformance,
            averageTimePerSubject,
            subjectsAttempted: pqSubjectProgress,
            perSubjectResults,
          };
          if (totalSubjects.subjects) {
            dataToPush.totalSubjectsCount = totalSubjects.subjects.length;
          }
          examsList.push(dataToPush);
        }
      }
      /* pq */
      const subjects = await Subject.find({
        courseId: req.params.courseId,
      })
        .populate({
          path: "mainSubjectId",
          select: "name imageUrl classification -_id",
          model: MainSubject,
        })
        .populate({
          path: "relatedLessons",
        });
      const subjectsList = [];

      for (let index = 0; index < subjects.length; index++) {
        const subject = subjects[index];

        /* progress */
        const subjectProgressData = {
          userId: req.body.userId ? req.body.userId : req.data.id,
          courseId: req.params.courseId,
          subjectId: subject._id,
          classId: null,
        };
        const incomingSubjectProgress = await SubjectProgress.find(
          subjectProgressData
        ).countDocuments();
        const subjectProgress =
          (incomingSubjectProgress / subject.relatedLessons.length) * 100;
        /* progress */

        /* performance */
        const resultCondition = {
          userId: req.body.userId ? req.body.userId : req.data.id,
          courseId: req.params.courseId,
          subjectId: subject._id,
          classId: null,
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
          numberOfTests: results.length,
          totalTests: subject.relatedLessons.length,
        });
      }
      return res.status(200).json({
        status: "success",
        data: {
          subjectsList,
          examsList,
          status: " without class",
          user: userWithThisPerformance,
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
   * Get past Question performance for a Cousre
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CourseController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getCoursePastQuestionPerformance(req, res) {
    try {
      const userID = req.body.userId || req.data.id;
      /* pq */
      const relatedPq = await RelatedPastQuestion.find({
        courseId: req.params.courseId,
      }).populate({
        path: "pastQuestionTypes",
        select: "name categoryId",
        model: PastQuestionType,
      });
      const examsList = [];
      // relatedPq.forEach(pq => {

      // });
      for (let index = 0; index < relatedPq.length; index++) {
        const pq = relatedPq[index];

        for (let index = 0; index < pq.pastQuestionTypes.length; index++) {
          const item = pq.pastQuestionTypes[index];

          /* Total performance */
          const pastQuestionResultCondition = {
            userId: userID,
            courseId: req.params.courseId,
            pastQuestionCategoryId: item.categoryId,
          };
          if (req.body.classId) {
            pastQuestionResultCondition.classId = req.body.classId;
          } else {
            pastQuestionResultCondition.classId = null;
          }
          const pastQuestionResults = await PastQuestionQuizResult.find(
            pastQuestionResultCondition
          );
          let pqTotalScore = 0;
          let totalTimeSpentOnQuestion = 0;
          pastQuestionResults.forEach((result) => {
            pqTotalScore += result.score;
            totalTimeSpentOnQuestion += parseInt(result.timeSpent, 10);
          });
          const pqPerformance = pqTotalScore / pastQuestionResults.length;
          const averageTimePerSubject =
            totalTimeSpentOnQuestion / pastQuestionResults.length;
          /* Total performance */

          /* progress */
          const { data: totalSubjects } = await axios.get(
            `https://api.exambly.com/adminpanel/v2/getMySubjects/${item.categoryId}`,
            {
              headers: {
                "Content-type": "application/json",
                authorization:
                  "F0c7ljTmi25e7LMIF0Wz01lZlkHX9b57DFTqUHFyWeVOlKAsKR0E5JdBOvdunpqv",
              },
            }
          );
          /* subjectIDs */
          const subjectIds = [];
          const perSubjectResults = [];
          if (totalSubjects.subjects) {
            totalSubjects.subjects.forEach((subject) => {
              const result = pastQuestionResults.find(
                (rslt) => rslt.subjectCategoryId === parseInt(subject.id, 10)
              );
              perSubjectResults.push({
                name: subject.subject,
                score: result ? result.score : 0,
              });
            });
          }

          const pastQuestionProgressData = {
            userId: req.body.userId ? req.body.userId : req.data.id,
            courseId: req.params.courseId,
            pastQuestionCategoryId: item.categoryId,
          };
          if (req.body.classId) {
            pastQuestionProgressData.classId = req.body.classId;
          } else {
            pastQuestionProgressData.classId = null;
          }
          const pqSubjectProgress = await PastQuestionProgress.find({
            ...pastQuestionProgressData,
          }).countDocuments();
          //   /* progress */
          const toPush = {
            name: item.name,
            exam_id: item.categoryId,
            performance: pqPerformance,
            averageTimePerSubject,
            subjectsAttempted: pqSubjectProgress,
            perSubjectResults,
          };
          if (totalSubjects.subjects) {
            toPush.totalSubjectsCount = totalSubjects.subjects.length;
          }
          examsList.push(toPush);
        }
      }

      return res.status(200).json({
        status: "success",
        data: {
          examsList,
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
   * Get subject performance for a Cousre
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CourseController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getCourseSubjectPerformance(req, res) {
    try {
      const userID = req.body.userId || req.data.id;

      const subjects = await Subject.find({
        courseId: req.params.courseId,
      })
        .populate({
          path: "mainSubjectId",
          select: "name imageUrl classification -_id",
          model: MainSubject,
        })
        .populate({
          path: "relatedLessons",
          select: "title",
        });
      const subjectsList = [];
      for (let index = 0; index < subjects.length; index++) {
        const subject = subjects[index];

        /* performance */
        const resultCondition = {
          userId: userID,
          courseId: req.params.courseId,
          subjectId: subject._id,
        };
        if (req.body.classId) {
          resultCondition.classId = req.body.classId;
        } else {
          resultCondition.classId = null;
        }
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
          totalQuestionsCorrect,
          totalQuestions,
          averageTimePerTest,
          numberOfTests: results.length,
          totalTests: subject.relatedLessons.length,
        });
      }
      return res.status(200).json({
        status: "success",
        data: {
          subjectsList,
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
   * Get progress for a Cousre
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof CourseController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getCourseProgress(req, res) {
    try {
      const userID = req.body.userId || req.data.id;
      const subjects = await Subject.find({
        courseId: req.params.courseId,
      })
        .populate({
          path: "mainSubjectId",
          select: "name imageUrl classification -_id",
          model: MainSubject,
        })
        .populate({
          path: "relatedLessons",
          select: "title",
        });

      const subjectsList = [];
      for (let index = 0; index < subjects.length; index++) {
        const subject = subjects[index];

        /* progress */
        const subjectProgressData = {
          userId: userID,
          courseId: req.params.courseId,
          subjectId: subject._id,
        };
        if (req.body.classId) {
          subjectProgressData.classId = req.body.classId;
        } else {
          subjectProgressData.classId = null;
        }
        const incomingSubjectProgress = await SubjectProgress.find(
          subjectProgressData
        ).countDocuments();
        const subjectProgress =
          (incomingSubjectProgress / subject.relatedLessons.length) * 100;
        /* progress */

        subjectsList.push({
          subject: subject.mainSubjectId.name,
          progress: subjectProgress,
        });
      }
      return res.status(200).json({
        status: "success",
        data: {
          subjectsList,
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
        select: "name imageUrl classification -_id",
        model: MainSubject,
      });

      const relatedPastQuestions = await RelatedPastQuestion.find({
        courseId: req.params.courseId,
      })
        .select("pastQuestionTypeId")
        .populate({ path: "pastQuestionTypeId", select: "name categoryId" });
      return res.status(200).json({
        status: "success",
        data: {
          subjects,
          relatedPastQuestions,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Loading subjects",
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
    const { courseId, subjectId, lessonId } = req.body;
    try {
      const otherLessons = await Lesson.find({
        courseId,
        subjectId,
        _id: { $ne: lessonId },
      });

      const randomLesson =
        otherLessons[Math.floor(Math.random() * otherLessons.length)];
      const recommended = randomLesson._id;
      const latestRecommendation = await Recommendation.find()
        .sort({ createdAt: -1 })
        .limit(1); // latest docs
      const existingRecommendation =
        latestRecommendation &&
        latestRecommendation[0] &&
        latestRecommendation[0].recommended === recommended;

      if (!existingRecommendation) {
        await Recommendation.create({
          userId: req.data.id,
          type: req.body.type,
          recommended,
          reason: req.body.reason,
        });
      }
      const condition = {
        userId: req.data.id,
        courseId,
        subjectId,
        lessonId,
      };
      if (req.body.classId) {
        condition.classId = req.body.classId;
      }
      const exist = await SubjectProgress.findOne(condition);
      if (!exist) {
        await SubjectProgress.create({
          ...req.body,
          userId: req.data.id,
        });
      }
      return res.status(201).json({
        status: "success",
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error submitting progress",
      });
    }
  }
}
export default CourseController;
