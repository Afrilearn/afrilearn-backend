import Question from "../db/models/questions.model";
import QuizResult from "../db/models/quizResults.model";
import Lesson from "../db/models/lessons.model";
import Subject from "../db/models/subjects.model";
import EnrolledCourse from "../db/models/enrolledCourses.model";
import ResumePlaying from "../db/models/resumePlaying.model";
import Favourite from "../db/models/favourite.model";
import sendEmail from "../utils/email.utils";
import lessonsJSON from "../lessons.json";
const fs = require("fs");
const request = require("request");
import { randomString } from "../config/randomString";
import MainSubject from "../db/models/mainSubjects.model";
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
      //console.log(error);
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
      //console.log(error);
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
      //console.log(error);
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
      //console.log(error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error reporting lesson",
      });
    }
  }

  static async getLessonsForWaecApp(req, res) {
    try {
      // const data = lessonsJSON;
      // const sss1 = lessonsJSON.sss1;

      // const sss2 = lessonsJSON.sss2;

      // const sss3 = lessonsJSON.sss3;
      const url =
        "https://afrilearn-media.s3.eu-west-3.amazonaws.com/subject_images/english.png";
      const lessons = [
        {
          likes: [
            "6124ca5b200c6a00165531da",
            "618bc5f8c07b8b0016b18055",
            "618bc5f8c07b8b0016b18055",
          ],
          views: 28,
          _id: "6012d974cfe09249249f9254",
          subjectId: {
            _id: "60119c3831c66a2ebd9eb4ff",
            mainSubjectId: {
              _id: "5fca6b75724ea10be8d7118b",
              name: "English",
              id: "5fca6b75724ea10be8d7118b",
            },
            id: "60119c3831c66a2ebd9eb4ff",
          },
          courseId: "5fff7371de0bdb47f826feb2",
          termId: {
            _id: "5fc8d1b20fae0a06bc22db5c",
            name: "First term",
            createdAt: "2020-12-03T11:53:23.078Z",
            updatedAt: "2020-12-03T11:53:23.078Z",
            __v: 0,
            id: "5fc8d1b20fae0a06bc22db5c",
          },
          title:
            "Reading Skills; Word Meanings in Context Structure: Introduction to Phrasal Verbs; More on Parts of Speech- Adverb, Conjunction and Preposition. Vocabulary Development: Words Associated with Libraries",
          content:
            '&nbsp;\r\n\r\n<em><strong>Welcome to class! </strong></em>\r\n\r\nIn today’s class, we will be talking about parts of speech, etc. Enjoy the class!\r\n<h3><strong>Reading Skills.</strong></h3>\r\n<h3><strong> Word Meanings in Context Structure</strong></h3>\r\n<h3><strong> Introduction to Phrasal Verbs</strong></h3>\r\n<h3><strong> More on Parts of Speech- Adverb, Conjunction and Preposition. </strong></h3>\r\n<h3><strong>Vocabulary Development: Words Associated with Libraries</strong></h3>\r\n<img class="alignnone wp-image-15958" src="https://classnotes.ng/wp-content/uploads/2020/04/comprehension-english-classnotesng.jpg" alt="comprehension english classnotes.ng" width="491" height="276" />\r\n<ul>\r\n \t<li>\r\n<h4><strong> Comprehension/reading skills</strong></h4>\r\n</li>\r\n</ul>\r\n<strong>Religion</strong>\r\n\r\nReligion Unit 3 page 54-55 of  Effective English.\r\n\r\nThe passage talks about the relationship between man and the deity (god) in the account of Yoruba beliefs.\r\n\r\nThe second part of the passage gives an example of a part of the TIV ritual for giving a householder power over the forces that control dysentery (Igbe). By this ritual, the householder joins a particular cult (i.e. he is initiated).\r\n\r\n<strong>Evaluation</strong>\r\n\r\nPractice 3, page 56, unit 3 of Effective English.\r\n\r\n&nbsp;\r\n<ul>\r\n \t<li>\r\n<h4><strong>Structure: Introduction to phrasal verbs</strong></h4>\r\n</li>\r\n</ul>\r\n<h5><img class="n3VNCb alignnone" src="https://i.ytimg.com/vi/GW8i5s2KauY/maxresdefault.jpg" alt="Phrasal Verbs classnotes.ng" width="489" height="275" data-iml="47198.96000000881" /></h5>\r\n<h5><strong>Phrasal Verbs:</strong></h5>\r\nVerbs often combine with adverbial particles to form multi-word verbs or phrasal verbs. Its meanings cannot be determined from the meaning of the verb and the particles in isolation, rather, it has to be comprehended from the entire phrase\r\n\r\n<strong>Examples </strong>\r\n<ol>\r\n \t<li><strong>turn down</strong>: refuse: I <u>turned down</u> the offer</li>\r\n \t<li><strong>give in</strong>: surrender: Our team refused to<strong><u> give in</u></strong> to their opponents.</li>\r\n \t<li><strong>run across</strong>: meet by chance: We <strong><u>ran across</u></strong> an old friend yesterday at Aba.</li>\r\n \t<li><strong>call off</strong>: cancel: The workers have <strong><u>called off</u></strong> their strike.</li>\r\n \t<li><strong>turn up</strong>: appear: He <strong><u>turned up</u></strong> as soon as we arrived.</li>\r\n \t<li><strong>put off</strong>: postpone: The election was <strong><u>put off</u></strong> till the next meeting.</li>\r\n \t<li><strong>come across: </strong>meet by chance: We <strong><u>came across</u></strong> Ledogo in the street.</li>\r\n \t<li><strong>come through:</strong> experience: He has <strong><u>come through</u></strong> a lot of hardship in life.</li>\r\n</ol>\r\nPhrasal verbs with double particles and the whole combination have a single meaning e.g. Put up with= tolerate (I cannot <strong><u>put up with</u></strong> his insulting behaviour)\r\n<ol>\r\n \t<li><strong>cut down on: </strong>reduce:  We have been advised <strong><u>to cut down on </u></strong>our expenses.</li>\r\n \t<li><strong>get away with: </strong>go free from: He cannot <strong><u>get away with </u></strong>the crime.</li>\r\n \t<li><strong>look forward to:</strong> anticipate: We <strong><u>look forward to </u></strong>your next visit.</li>\r\n \t<li><strong>stay away from:</strong> avoid:  You have been warned to <span style="text-decoration: underline;">st</span><strong><span style="text-decoration: underline;">a</span><u>y away from the</u></strong> building.</li>\r\n</ol>\r\n<strong>Evaluation</strong>\r\n\r\nChoose five words from the phrasal verbs taught and use them in sentences.\r\n<h6><strong>Assignment</strong></h6>\r\nLook up the meaning of each of the following phrasal verbs:\r\n\r\n<strong>hook up</strong>,     <strong>give up</strong>,\r\n\r\n<strong>round off,    round up,</strong>\r\n\r\n<strong>turn out,     break into,</strong>\r\n\r\n<strong>touch down, cut in</strong>\r\n\r\n&nbsp;\r\n<ul>\r\n \t<li>\r\n<h4><strong>Adverbs, Conjunction and Preposition</strong></h4>\r\n</li>\r\n</ul>\r\n<h5><img class="alignnone wp-image-17353" src="https://classnotes.ng/wp-content/uploads/2020/04/adverb-english-language-classnotesng.jpg" alt="adverb english language classnotesng" width="491" height="289" /></h5>\r\n<h5><strong>Adverb:</strong></h5>\r\nAn adverb is a word which modifies verbs, adjectives and other adverbs.\r\n<h6><strong>Formation of adverbs</strong></h6>\r\n<ol>\r\n \t<li><strong>Many adverbs are formed from adjectives</strong> e.g. certain- certainly    fortunate- fortunately, careful-carefully, quick- quickly, indoor-indoors, outdoor-outdoors</li>\r\n \t<li><strong>Some Adverbs showing direction end inwards</strong> e.g. downwards, forwards, backwards,</li>\r\n \t<li><strong>Some adverbs expressing manner or viewpoint end in – wise</strong> e.g. clockwise, food-wise, moneywise.</li>\r\n \t<li><strong>Many other adverbs have no special ending -</strong> always, early, fast, if, how, quite, often, very, when, hard, late, so, very.</li>\r\n</ol>\r\n<h6><strong>Types of adverbs</strong></h6>\r\n<ul>\r\n \t<li><strong>Adjuncts:</strong> These normally tell us how, when, where, to what extent, etc, the action of the verb is performed.</li>\r\n</ul>\r\n<strong>Examples:</strong>\r\n<ol>\r\n \t<li>He came at 6 O’clock (when)</li>\r\n \t<li>She ran fast. (How?)</li>\r\n</ol>\r\n<ul>\r\n \t<li><strong>Disjuncts: </strong>These normally express an attitude or a viewpoint, often of the speaker.</li>\r\n</ul>\r\n<strong>Examples:</strong>\r\n<ol>\r\n \t<li>Luckily She arrived.</li>\r\n \t<li><u>Frankly</u>, we were in the wrong.</li>\r\n \t<li>Ola is <u>certainly</u> the best.</li>\r\n \t<li><u>Foolishly</u>, he fell.</li>\r\n</ol>\r\nOther examples are honestly, seriously, strangely, undoubtedly, happily, fortunately\r\n<ul>\r\n \t<li><strong>Conjuncts:</strong> These perform a connective function: they join two sentences or clauses.</li>\r\n</ul>\r\n<strong>Examples:</strong>\r\n<ol>\r\n \t<li>It was a hard task, nevertheless, we performed well.</li>\r\n \t<li>She is hardworking, besides, she is intelligent.</li>\r\n</ol>\r\nOther examples are, consequently, meanwhile, otherwise, similarly, then, alternately etc.\r\n<h5><img class="n3VNCb alignnone" src="https://media.proprofs.com/images/QM/user_images/2503852/New%20Project%20(40)(34).jpg" alt="Conjunctions classnotes.ng" width="498" height="245" data-iml="41294.20000000391" /></h5>\r\n<h5><strong>Conjunctions:</strong></h5>\r\nA conjunction is a word which joins words, or groups of words, together.\r\n<h6><strong>Types of conjunctions</strong></h6>\r\n<ul>\r\n \t<li><strong>Coordinating conjunctions:</strong> These conjunctions join words or groups of words that are of the grammatical rank. Examples are; and, or, but.</li>\r\n</ul>\r\nE.g. Joy and Jane, in the garden and in the room; Bolu or Joy, We came but you were not around; We went and we saw him<strong>.</strong>\r\n<ul>\r\n \t<li><strong>Correlative conjunctions:</strong> These are conjunctions that are used in pairs. E.g. either….or, not only….but also, both……and, neither….nor.</li>\r\n</ul>\r\nE.g. Both James and Jerry attended the party, She is not only intelligent but also kind.\r\n\r\n<em>Either</em> the teacher <em>or</em> the man comes here regularly.\r\n<ul>\r\n \t<li><strong>Subordinating conjunctions:</strong> These conjunctions introduce subordinating clauses. They include the following conjunctions: after, because, before, if, in order that, since, which, when, who, whose, that etc.</li>\r\n</ul>\r\nConsider these: He left when she was cooking. We cooked <em>before</em> they arrived.\r\n<h5><img class="n3VNCb alignnone" src="https://englishstudypage.com/wp-content/uploads/2020/05/What-is-a-Preposition-40-Preposition-List.png" alt="preposition classnotes.ng" width="491" height="276" data-iml="11639.385000016773" /></h5>\r\n<h5><strong>Preposition</strong></h5>\r\nThis shows the relationship between two words in a sentence. Examples are: within, before, at, in, on, over etc.\r\n\r\n<strong>Some prepositions go with certain words</strong>\r\n\r\nallergic to,               subjected to,                   arrive in,                       live in,            live on,       live at,                       stare at,                         indict for,                convicted of,       victim of,\r\n\r\ndown with{fever},      charge with,               abide by{rule},              come by,           good at, abide with{a person},       kick against,            connive at,                quick at,            bad at,\r\n\r\nspy at,                 frown at  consist of,           confidence in,              confide in,       senior to,\r\n\r\njunior to,                 related to,                      agree to{a plan},        in different to,    part with, agree with{a person},   recoil from,       popular with{girls},             tremble with,      die on,\r\n\r\ndiffer with,                comply with,                       blame on,        hinges on,         wait upon.\r\n<h6><strong> </strong></h6>\r\n<strong>Others include:</strong>\r\n\r\nin agreement with,     in compliance with,                in apposition with,            because of,       in a view of,              in accordance with,               for the sake of,     on account of,                   with regard to,       with reference to,                   with respect to,                 in spite of,               by reason of,               in case of,                             in regard to,            by means of,          along with,                  in consideration of,               contrary to,          in addition with.\r\n\r\n<strong><img class="n3VNCb alignnone" src="https://i2.wp.com/scholarshipjamaica.com/wp-content/uploads/2018/01/LIAJA-library-studies-1.jpg?fit=600%2C400&amp;ssl=1" alt="library classnotes.ng" width="485" height="323" data-iml="190550.55499999435" />\r\n</strong>\r\n<ul>\r\n \t<li>\r\n<h4><strong>Vocabulary development: Words associated with library</strong></h4>\r\n</li>\r\n</ul>\r\nA library is a room or building containing books that can be looked at or borrowed.\r\n<h5><strong>Relevant words</strong></h5>\r\n<ol>\r\n \t<li><strong>Bindery:</strong>  A Place where books are bound (or repaired)</li>\r\n \t<li><strong>Catalogue</strong>: List of items (books) available in a collection especially in a library.</li>\r\n \t<li><strong>Entry Card</strong>: Card on which details about a book are recorded.</li>\r\n \t<li><strong>Shelf-guide:</strong> Instructions: especially numbers that show which books can be found on a particular shelf</li>\r\n \t<li><strong>Encyclopedia:</strong> A book or set of books containing facts about many different subjects or about one particular subject.</li>\r\n</ol>\r\n<strong>Evaluation</strong>\r\n\r\nExercise (b) page 160 of Countdown by Evans.\r\n\r\n&nbsp;\r\n<h6><strong>General evaluation</strong></h6>\r\nChoose the best option to fill the gap in each of the sentences.\r\n<ol>\r\n \t<li>The handset was faulty which made it impossible to ……………… them by the phone. (a) get at (b) get over to  (c) get through to  (d) get on to</li>\r\n \t<li>The citizens………………… their leaders for good examples. (a) come along (b) come off (c) come on (d) come up</li>\r\n \t<li>Despite all preparation, the event did not ………… (a)come along (b)come off (c)come on (d)come up</li>\r\n \t<li>Lagos witnessed the largest …………….of voters at the recently concluded elections (a)turn on (b)turn out (c)turn over (d)turn around</li>\r\n \t<li>While the worshippers closed their eyes in prayers, a thief ………… with the collection (a)made out (b) made away   (c) made up  (d) made through</li>\r\n</ol>\r\n<strong>Reading assignment</strong>\r\n\r\nPage 159 of Countdown by Evans\r\n\r\n<strong> </strong>\r\n\r\nIn our next class, we will be talking about <strong>Essay Writing, Speech Work: Monophthongs;  Idioms, Vocabulary Development: Words Associated with Entertainment</strong>.  We hope you enjoyed the class.\r\n\r\nShould you have any further question, feel free to ask in the comment section below and trust us to respond as soon as possible.',
          __v: 5,
          createdAt: "2021-07-16T03:36:37.884Z",
          updatedAt: "2021-11-17T05:07:38.053Z",
          id: "6012d974cfe09249249f9254",
        },
      ];

      const content =
        '&nbsp;\r\n\r\n<em><strong>Welcome to class! </strong></em>\r\n\r\nIn today’s class, we will be talking about parts of speech, etc. Enjoy the class!\r\n<h3><strong>Reading Skills.</strong></h3>\r\n<h3><strong> Word Meanings in Context Structure</strong></h3>\r\n<h3><strong> Introduction to Phrasal Verbs</strong></h3>\r\n<h3><strong> More on Parts of Speech- Adverb, Conjunction and Preposition. </strong></h3>\r\n<h3><strong>Vocabulary Development: Words Associated with Libraries</strong></h3>\r\n<img class="alignnone wp-image-15958" src="https://classnotes.ng/wp-content/uploads/2020/04/comprehension-english-classnotesng.jpg" alt="comprehension english classnotes.ng" width="491" height="276" />\r\n<ul>\r\n \t<li>\r\n<h4><strong> Comprehension/reading skills</strong></h4>\r\n</li>\r\n</ul>\r\n<strong>Religion</strong>\r\n\r\nReligion Unit 3 page 54-55 of  Effective English.\r\n\r\nThe passage talks about the relationship between man and the deity (god) in the account of Yoruba beliefs.\r\n\r\nThe second part of the passage gives an example of a part of the TIV ritual for giving a householder power over the forces that control dysentery (Igbe). By this ritual, the householder joins a particular cult (i.e. he is initiated).\r\n\r\n<strong>Evaluation</strong>\r\n\r\nPractice 3, page 56, unit 3 of Effective English.\r\n\r\n&nbsp;\r\n<ul>\r\n \t<li>\r\n<h4><strong>Structure: Introduction to phrasal verbs</strong></h4>\r\n</li>\r\n</ul>\r\n<h5><img class="n3VNCb alignnone" src="https://i.ytimg.com/vi/GW8i5s2KauY/maxresdefault.jpg" alt="Phrasal Verbs classnotes.ng" width="489" height="275" data-iml="47198.96000000881" /></h5>\r\n<h5><strong>Phrasal Verbs:</strong></h5>\r\nVerbs often combine with adverbial particles to form multi-word verbs or phrasal verbs. Its meanings cannot be determined from the meaning of the verb and the particles in isolation, rather, it has to be comprehended from the entire phrase\r\n\r\n<strong>Examples </strong>\r\n<ol>\r\n \t<li><strong>turn down</strong>: refuse: I <u>turned down</u> the offer</li>\r\n \t<li><strong>give in</strong>: surrender: Our team refused to<strong><u> give in</u></strong> to their opponents.</li>\r\n \t<li><strong>run across</strong>: meet by chance: We <strong><u>ran across</u></strong> an old friend yesterday at Aba.</li>\r\n \t<li><strong>call off</strong>: cancel: The workers have <strong><u>called off</u></strong> their strike.</li>\r\n \t<li><strong>turn up</strong>: appear: He <strong><u>turned up</u></strong> as soon as we arrived.</li>\r\n \t<li><strong>put off</strong>: postpone: The election was <strong><u>put off</u></strong> till the next meeting.</li>\r\n \t<li><strong>come across: </strong>meet by chance: We <strong><u>came across</u></strong> Ledogo in the street.</li>\r\n \t<li><strong>come through:</strong> experience: He has <strong><u>come through</u></strong> a lot of hardship in life.</li>\r\n</ol>\r\nPhrasal verbs with double particles and the whole combination have a single meaning e.g. Put up with= tolerate (I cannot <strong><u>put up with</u></strong> his insulting behaviour)\r\n<ol>\r\n \t<li><strong>cut down on: </strong>reduce:  We have been advised <strong><u>to cut down on </u></strong>our expenses.</li>\r\n \t<li><strong>get away with: </strong>go free from: He cannot <strong><u>get away with </u></strong>the crime.</li>\r\n \t<li><strong>look forward to:</strong> anticipate: We <strong><u>look forward to </u></strong>your next visit.</li>\r\n \t<li><strong>stay away from:</strong> avoid:  You have been warned to <span style="text-decoration: underline;">st</span><strong><span style="text-decoration: underline;">a</span><u>y away from the</u></strong> building.</li>\r\n</ol>\r\n<strong>Evaluation</strong>\r\n\r\nChoose five words from the phrasal verbs taught and use them in sentences.\r\n<h6><strong>Assignment</strong></h6>\r\nLook up the meaning of each of the following phrasal verbs:\r\n\r\n<strong>hook up</strong>,     <strong>give up</strong>,\r\n\r\n<strong>round off,    round up,</strong>\r\n\r\n<strong>turn out,     break into,</strong>\r\n\r\n<strong>touch down, cut in</strong>\r\n\r\n&nbsp;\r\n<ul>\r\n \t<li>\r\n<h4><strong>Adverbs, Conjunction and Preposition</strong></h4>\r\n</li>\r\n</ul>\r\n<h5><img class="alignnone wp-image-17353" src="https://classnotes.ng/wp-content/uploads/2020/04/adverb-english-language-classnotesng.jpg" alt="adverb english language classnotesng" width="491" height="289" /></h5>\r\n<h5><strong>Adverb:</strong></h5>\r\nAn adverb is a word which modifies verbs, adjectives and other adverbs.\r\n<h6><strong>Formation of adverbs</strong></h6>\r\n<ol>\r\n \t<li><strong>Many adverbs are formed from adjectives</strong> e.g. certain- certainly    fortunate- fortunately, careful-carefully, quick- quickly, indoor-indoors, outdoor-outdoors</li>\r\n \t<li><strong>Some Adverbs showing direction end inwards</strong> e.g. downwards, forwards, backwards,</li>\r\n \t<li><strong>Some adverbs expressing manner or viewpoint end in – wise</strong> e.g. clockwise, food-wise, moneywise.</li>\r\n \t<li><strong>Many other adverbs have no special ending -</strong> always, early, fast, if, how, quite, often, very, when, hard, late, so, very.</li>\r\n</ol>\r\n<h6><strong>Types of adverbs</strong></h6>\r\n<ul>\r\n \t<li><strong>Adjuncts:</strong> These normally tell us how, when, where, to what extent, etc, the action of the verb is performed.</li>\r\n</ul>\r\n<strong>Examples:</strong>\r\n<ol>\r\n \t<li>He came at 6 O’clock (when)</li>\r\n \t<li>She ran fast. (How?)</li>\r\n</ol>\r\n<ul>\r\n \t<li><strong>Disjuncts: </strong>These normally express an attitude or a viewpoint, often of the speaker.</li>\r\n</ul>\r\n<strong>Examples:</strong>\r\n<ol>\r\n \t<li>Luckily She arrived.</li>\r\n \t<li><u>Frankly</u>, we were in the wrong.</li>\r\n \t<li>Ola is <u>certainly</u> the best.</li>\r\n \t<li><u>Foolishly</u>, he fell.</li>\r\n</ol>\r\nOther examples are honestly, seriously, strangely, undoubtedly, happily, fortunately\r\n<ul>\r\n \t<li><strong>Conjuncts:</strong> These perform a connective function: they join two sentences or clauses.</li>\r\n</ul>\r\n<strong>Examples:</strong>\r\n<ol>\r\n \t<li>It was a hard task, nevertheless, we performed well.</li>\r\n \t<li>She is hardworking, besides, she is intelligent.</li>\r\n</ol>\r\nOther examples are, consequently, meanwhile, otherwise, similarly, then, alternately etc.\r\n<h5><img class="n3VNCb alignnone" src="https://media.proprofs.com/images/QM/user_images/2503852/New%20Project%20(40)(34).jpg" alt="Conjunctions classnotes.ng" width="498" height="245" data-iml="41294.20000000391" /></h5>\r\n<h5><strong>Conjunctions:</strong></h5>\r\nA conjunction is a word which joins words, or groups of words, together.\r\n<h6><strong>Types of conjunctions</strong></h6>\r\n<ul>\r\n \t<li><strong>Coordinating conjunctions:</strong> These conjunctions join words or groups of words that are of the grammatical rank. Examples are; and, or, but.</li>\r\n</ul>\r\nE.g. Joy and Jane, in the garden and in the room; Bolu or Joy, We came but you were not around; We went and we saw him<strong>.</strong>\r\n<ul>\r\n \t<li><strong>Correlative conjunctions:</strong> These are conjunctions that are used in pairs. E.g. either….or, not only….but also, both……and, neither….nor.</li>\r\n</ul>\r\nE.g. Both James and Jerry attended the party, She is not only intelligent but also kind.\r\n\r\n<em>Either</em> the teacher <em>or</em> the man comes here regularly.\r\n<ul>\r\n \t<li><strong>Subordinating conjunctions:</strong> These conjunctions introduce subordinating clauses. They include the following conjunctions: after, because, before, if, in order that, since, which, when, who, whose, that etc.</li>\r\n</ul>\r\nConsider these: He left when she was cooking. We cooked <em>before</em> they arrived.\r\n<h5><img class="n3VNCb alignnone" src="https://englishstudypage.com/wp-content/uploads/2020/05/What-is-a-Preposition-40-Preposition-List.png" alt="preposition classnotes.ng" width="491" height="276" data-iml="11639.385000016773" /></h5>\r\n<h5><strong>Preposition</strong></h5>\r\nThis shows the relationship between two words in a sentence. Examples are: within, before, at, in, on, over etc.\r\n\r\n<strong>Some prepositions go with certain words</strong>\r\n\r\nallergic to,               subjected to,                   arrive in,                       live in,            live on,       live at,                       stare at,                         indict for,                convicted of,       victim of,\r\n\r\ndown with{fever},      charge with,               abide by{rule},              come by,           good at, abide with{a person},       kick against,            connive at,                quick at,            bad at,\r\n\r\nspy at,                 frown at  consist of,           confidence in,              confide in,       senior to,\r\n\r\njunior to,                 related to,                      agree to{a plan},        in different to,    part with, agree with{a person},   recoil from,       popular with{girls},             tremble with,      die on,\r\n\r\ndiffer with,                comply with,                       blame on,        hinges on,         wait upon.\r\n<h6><strong> </strong></h6>\r\n<strong>Others include:</strong>\r\n\r\nin agreement with,     in compliance with,                in apposition with,            because of,       in a view of,              in accordance with,               for the sake of,     on account of,                   with regard to,       with reference to,                   with respect to,                 in spite of,               by reason of,               in case of,                             in regard to,            by means of,          along with,                  in consideration of,               contrary to,          in addition with.\r\n\r\n<strong><img class="n3VNCb alignnone" src="https://i2.wp.com/scholarshipjamaica.com/wp-content/uploads/2018/01/LIAJA-library-studies-1.jpg?fit=600%2C400&amp;ssl=1" alt="library classnotes.ng" width="485" height="323" data-iml="190550.55499999435" />\r\n</strong>\r\n<ul>\r\n \t<li>\r\n<h4><strong>Vocabulary development: Words associated with library</strong></h4>\r\n</li>\r\n</ul>\r\nA library is a room or building containing books that can be looked at or borrowed.\r\n<h5><strong>Relevant words</strong></h5>\r\n<ol>\r\n \t<li><strong>Bindery:</strong>  A Place where books are bound (or repaired)</li>\r\n \t<li><strong>Catalogue</strong>: List of items (books) available in a collection especially in a library.</li>\r\n \t<li><strong>Entry Card</strong>: Card on which details about a book are recorded.</li>\r\n \t<li><strong>Shelf-guide:</strong> Instructions: especially numbers that show which books can be found on a particular shelf</li>\r\n \t<li><strong>Encyclopedia:</strong> A book or set of books containing facts about many different subjects or about one particular subject.</li>\r\n</ol>\r\n<strong>Evaluation</strong>\r\n\r\nExercise (b) page 160 of Countdown by Evans.\r\n\r\n&nbsp;\r\n<h6><strong>General evaluation</strong></h6>\r\nChoose the best option to fill the gap in each of the sentences.\r\n<ol>\r\n \t<li>The handset was faulty which made it impossible to ……………… them by the phone. (a) get at (b) get over to  (c) get through to  (d) get on to</li>\r\n \t<li>The citizens………………… their leaders for good examples. (a) come along (b) come off (c) come on (d) come up</li>\r\n \t<li>Despite all preparation, the event did not ………… (a)come along (b)come off (c)come on (d)come up</li>\r\n \t<li>Lagos witnessed the largest …………….of voters at the recently concluded elections (a)turn on (b)turn out (c)turn over (d)turn around</li>\r\n \t<li>While the worshippers closed their eyes in prayers, a thief ………… with the collection (a)made out (b) made away   (c) made up  (d) made through</li>\r\n</ol>\r\n<strong>Reading assignment</strong>\r\n\r\nPage 159 of Countdown by Evans\r\n\r\n<strong> </strong>\r\n\r\nIn our next class, we will be talking about <strong>Essay Writing, Speech Work: Monophthongs;  Idioms, Vocabulary Development: Words Associated with Entertainment</strong>.  We hope you enjoyed the class.\r\n\r\nShould you have any further question, feel free to ask in the comment section below and trust us to respond as soon as possible.';
      const returnReplacedURLs = (text) => {
        var download = function (uri, filename, callback) {
          request.head(uri, function (err, res, body) {
            console.log("content-type:", res.headers["content-type"]);
            console.log("content-length:", res.headers["content-length"]);

            request(uri)
              .pipe(fs.createWriteStream(filename))
              .on("close", callback);
          });
        };
        // const links = [];
        var words = text.split('"');
        let replacedString = text;
        for (var i = 0; i < words.length; i++) {
          var word = words[i];
          if (word.indexOf("https://") === 0 || word.indexOf("www.") === 0) {
            const randomSng = randomString(9);
            download(word, `./images/${randomSng}.png`, function () {
              console.log("done", `./images/${randomSng}.png`);
            });
            // word = '[A LINK]' + '(' + word + ')';
            // links.push({ link: word, localAddress: `./images/${randomSng}.png` });
            replacedString = replacedString.replace(
              word,
              `./images/${randomSng}.png`
            );
          }
          // new_text += word + ' ';
        }
        return replacedString;
      };

      const processedLessonsSSS1 = lessonsJSON.sss1.map((x) => {
        return {
          subject: {
            ...x.subject,
            imageUrl: returnReplacedURLs(x.subject.imageUrl),
          },
          lessons: x.lessons.map((i) => {
            return {
              ...i,
              content: returnReplacedURLs(i.content),
            };
          }),
        };
      });
      const processedLessonsSSS2 = lessonsJSON.sss2.map((x) => {
        return {
          subject: {
            ...x.subject,
            imageUrl: returnReplacedURLs(x.subject.imageUrl),
          },
          lessons: x.lessons.map((i) => {
            return {
              ...i,
              content: returnReplacedURLs(i.content),
            };
          }),
        };
      });
      const processedLessonsSSS3 = lessonsJSON.sss3.map((x) => {
        return {
          subject: {
            ...x.subject,
            imageUrl: returnReplacedURLs(x.subject.imageUrl),
          },
          lessons: x.lessons.map((i) => {
            return {
              ...i,
              content: returnReplacedURLs(i.content),
            };
          }),
        };
      });

      // for (let index = 0; index < lessons.length; index++) {
      //   const lessonItem = lessons[index];

      // }

      // const nnnn = returnReplacedURLs(content);
      // const mmmm = returnReplacedURLs(url);

      return res.status(200).json({
        // sss1,
        // sss2,
        // sss3,
        // links,
        // replacedString,
        // nnnn,
        // mmmm,
        sss1: processedLessonsSSS1,
        sss2: processedLessonsSSS2,
        sss3: processedLessonsSSS3,
      });
    } catch (error) {
      //console.log(error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting lesson",
      });
    }
  }
}
export default LessonController;
