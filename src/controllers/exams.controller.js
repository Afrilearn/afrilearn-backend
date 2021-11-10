import Exam from "../db/models/exam.model";
import ExamQuestion from "../db/models/examQuestions.model";
import ExamQuestionType from "../db/models/examQuestionType.model";
import ExamResult from "../db/models/examResults.model";

class ExamController {
  static async createExam(req, res) {
    try {
      const data = {
        creatorId: req.data.id,
        ...req.body,
      };

      const exam = await Exam.create(data);
      const examPop = await Exam.findById(exam._id).populate("questions");

      return res.status(200).json({
        status: "success",
        data: {
          exam: examPop,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating exam.",
      });
    }
  }
  static async updateExam(req, res) {
    try {
      const exam = await Exam.findByIdAndUpdate(
        req.params.examId,
        {
          ...req.body,
        },
        {
          new: true,
        }
      )
        .populate({ path: "questionTypeId", select: "name" })
        .populate("questions")
        .populate({
          path: "results",
          select: "userId createdAt status score",
          populate: {
            path: "userId",
            select: "fullName",
          },
        });

      return res.status(200).json({
        status: "success",
        data: {
          exam,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating exam.",
      });
    }
  }
  static async getTeacherExams(req, res) {
    try {
      const exams = await Exam.find({ creatorId: req.data.id }).populate(
        "resultsCount questionTypeId"
      );

      return res.status(200).json({
        status: "success",
        data: {
          exams,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting exams.",
      });
    }
  }
  static async getResult(req, res) {
    try {
      const result = await ExamResult.findById(req.params.resultId)
        .populate({
          path: "userId",
          select: "fullName",
        })
        .populate("results.questionId");
      return res.status(200).json({
        status: "success",
        data: {
          result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting result.",
      });
    }
  }
  static async getExam(req, res) {
    try {
      const exam = await Exam.findById(req.params.examId)
        .populate({ path: "questionTypeId", select: "name" })
        .populate("questions")
        .populate({
          path: "results",
          select: "userId createdAt status score",
          populate: {
            path: "userId",
            select: "fullName",
          },
        });

      return res.status(200).json({
        status: "success",
        data: {
          exam,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting exams.",
      });
    }
  }
  static async readExamQuestions(req, res) {
    try {
      const questions = await ExamQuestion.find({ examId: req.params.examId });

      return res.status(200).json({
        status: "success",
        data: {
          questions,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting exam questions.",
      });
    }
  }
  static async getQuestion(req, res) {
    try {
      const question = await ExamQuestion.findById(req.params.questionId);

      return res.status(200).json({
        status: "success",
        data: {
          question,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting exam question.",
      });
    }
  }
  static async deleteQuestion(req, res) {
    try {
      const question = await ExamQuestion.findByIdAndDelete(
        req.params.questionId
      );

      return res.status(200).json({
        status: "success",
        data: {
          question,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error deleting exam question.",
      });
    }
  }
  static async createExamQuestion(req, res) {
    try {
      const data = {
        creatorId: req.data.id,
        ...req.body,
      };

      if (req.files && req.files.question_image) {
        data.question_image = req.files.question_image[0].location;
      }
      if (req.files && req.files.images) {
        data.images = req.files.images.map((i) => {
          return i.location;
        });
      }
      if (req.files && req.files.contentImages) {
        req.files.contentImages.forEach((img, index) => {
          data.question = data.question.replace(
            req.body.contentUrls[index],
            img.location
          );
        });
      }
      const examQuestion = await ExamQuestion.create(data);

      return res.status(200).json({
        status: "success",
        data: {
          examQuestion,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating exam question.",
      });
    }
  }
  static async createTheoryExamQuestion(req, res) {
    try {
      const data = {
        creatorId: req.data.id,
        ...req.body,
      };
      if (req.files.contentImages) {
        req.files.contentImages.forEach((img, index) => {
          data.question = data.question.replace(
            req.body.contentUrls[index],
            img.location
          );
        });
      }

      const examQuestion = await ExamQuestion.create(data);

      return res.status(200).json({
        status: "success",
        data: {
          examQuestion,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating exam question.",
      });
    }
  }
  static async updateTheoryExamQuestion(req, res) {
    try {
      const data = {
        ...req.body,
      };
      if (req.files && req.files.contentImages) {
        req.files.contentImages.forEach((img, index) => {
          data.question = data.question.replace(
            req.body.contentUrls[index],
            img.location
          );
        });
      }

      const examQuestion = await ExamQuestion.findByIdAndUpdate(
        req.params.questionId,
        { ...data },
        { new: true }
      );

      return res.status(200).json({
        status: "success",
        data: {
          examQuestion,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating exam question.",
      });
    }
  }
  static async createExamQuestionType(req, res) {
    try {
      const data = {
        creatorId: req.data.id,
        ...req.body,
      };

      const examType = await ExamQuestionType.create(data);

      return res.status(200).json({
        status: "success",
        data: {
          examType,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating exam question type.",
      });
    }
  }
  static async getExamQuestionType(req, res) {
    try {
      const examTypes = await ExamQuestionType.find({});

      return res.status(200).json({
        status: "success",
        data: {
          examTypes,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting exam question types.",
      });
    }
  }
  static async sendExamResultsToStudents(req, res) {
    try {
      const results = await ExamResult.find({
        examId: req.params.examId,
      }).populate({ path: "userId", select: "fullName email" });

      const pending = [];
      const marked = [];
      results.forEach((result) => {
        if (result.status === "pending") {
          pending.push({
            user: result.userId,
            remark: result.remark,
            percentage: result.percentage,
            score: result.score,
          });
        } else if (result.status === "marked") {
          marked.push({
            user: result.userId,
            remark: result.remark,
            percentage: result.percentage,
            score: result.score,
          });
        }
      });

      return res.status(200).json({
        status: "success",
        data: {
          pending,
          marked,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting exam results.",
      });
    }
  }
  static async saveExamResult(req, res) {
    const remarks = [
      "You were Excellent.",
      "Good Result.",
      "You can do better.",
    ];

    try {
      const data = {
        userId: req.data.id,
        ...req.body,
        score: 0,
        numberOfCorrectAnswers: 0,
        numberOfSkippedQuestions: 0,
        numberOfWrongAnswers: 0,
        percentage: 0,
        remark: "You participated.",
        total: 0,
      };
    
      req.body.results.forEach((result) => {
        data.total += result.markWeight;
        if (result.optionSelected) {
          if (result.optionSelected === result.correctOption) {
            data.score += result.markWeight;
            data.numberOfCorrectAnswers += 1;
          } else {
            data.numberOfWrongAnswers += 1;
          }
        } else {
          data.numberOfSkippedQuestions += 1;
        }
      });
      data.percentage = data.score / data.total;
      if (data.numberOfCorrectAnswers >= data.results.length * 0.7) {
        data.remark = remarks[0];
      }
      if (
        data.numberOfCorrectAnswers < data.results.length * 0.7 &&
        data.numberOfCorrectAnswers >= data.results.length * 0.5
      ) {
        data.remark = remarks[1];
      }
      if (data.numberOfCorrectAnswers < data.results.length * 0.5) {
        data.remark = remarks[2];
      }

      const result = await ExamResult.create(data);
      const exam = await Exam.findById(req.body.examId);
      await exam.update({ participants: [...exam.participants, req.data.id] });

      return res.status(200).json({
        status: "success",
        data: {
          result,
        },
      });
    } catch (error) {     
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error saving exam result.",
      });
    }
  }
  static async updateExamResult(req, res) {
    try {
      const result = await ExamResult.findByIdAndUpdate(
        req.params.resultId,
        {
          ...req.body,
        },
        {
          new: true,
        }
      );
      return res.status(200).json({
        status: "success",
        data: {
          result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error updating exam result.",
      });
    }
  }
  static async updateExamResultScore(req, res) {
    try {
      const result = await ExamResult.findById(req.params.resultId)
        .populate({
          path: "userId",
          select: "fullName",
        })
        .populate("results.questionId");
      const target = result.results.find(
        (i) => i._id == req.params.resultItemId
      );
      console.log("target", target);
      target.assignedScore = req.body.score;
      target.graded = true;
      await result.save();
      return res.status(200).json({
        status: "success",
        data: {
          result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error updating exam result.",
      });
    }
  }
  static async getStudentLatestExam(req, res) {
    try {
      const exams = await Exam.findOne({
        classId: req.params.classId,
        publish: true,
      })
        .select("subjectId termId title questionTypeId duration")
        .populate({
          path: "subjectId",
          select: "name",
          populate: {
            path: "mainSubjectId",
            select: "name",
          },
        })
        .populate({
          path: "termId",
          select: "name",
        })
        .populate({
          path: "questionTypeId",
          select: "name",
        })       
        .sort({
          createdAt: -1,
        });

      return res.status(200).json({
        status: "success",
        data: {
          exams,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting exams info for a class",
      });
    }
  }
  static async getExamInformation(req, res) {
    try {
      const exams = await Exam.findById(req.params.examId)
        .select("subjectId termId title questionTypeId duration")
        .populate({
          path: "subjectId",
          select: "name",
          populate: {
            path: "mainSubjectId",
            select: "name",
          },
        })
        .populate({
          path: "termId",
          select: "name",
        })
        .populate({
          path: "questionTypeId",
          select: "name",
        })
        .populate({
          path: "questionsCount"      
        })
        .sort({
          created_at: -1,
        });

      return res.status(200).json({
        status: "success",
        data: {
          exams,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting exams info for a class",
      });
    }
  }

  //Get Question Types [done]
  //Get Exams for teacher (populate submissions count) [done]
  //Get Exam (populate submissions i. results) [done]
  //Results status [done]
  //Get Result [done]
  //Add Theory Question [done]
  //Get question by id [done]
  //Delete Question [done]
  //Edit Exam [done]
  //Edit Question
  //Send Result to students [half-done]
  //Add Answer to result [done]
}
export default ExamController;
