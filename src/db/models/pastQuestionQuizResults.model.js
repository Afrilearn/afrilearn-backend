import mongoose from 'mongoose';

const PastQuestionQuizResultsSchema = new mongoose.Schema(
  {
    results: [
      {
        questionId: {
          type: Number, // question_id on exam platform
        },
        optionSelected: {
          type: Number,
        },
        correctOption: {
          type: Number,
        },
        status: {
          type: String,
          enum: ['correct', 'skipped', 'incorrect'],
        },
      },
    ],
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: 'class',
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'course',
    },
    subjectCategoryId: {
      type: Number, // subject_id on exam platform
    },
    subjectName: {
      type: String, // subject_id on exam platform
    },
    pastQuestionCategoryId: {
      type: Number, // exam_id on exam platform
    },
    pastQuestionTypeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'pastQuestionType',
    },
    timeSpent: {
      type: String,
    },
    numberOfCorrectAnswers: {
      type: Number,
    },
    numberOfWrongAnswers: {
      type: Number,
    },
    numberOfSkippedQuestions: {
      type: Number,
    },
    score: {
      type: Number,
    },
    remark: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true },
);

const PastQuestionQuizResult = mongoose.model(
  'pastQuestionQuizResult',
  PastQuestionQuizResultsSchema,
);

export default PastQuestionQuizResult;
