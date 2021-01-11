import mongoose from 'mongoose';

const PastQuestionQuizResultsSchema = new mongoose.Schema(
  {
    results: [
      {
        questionId: {
          type: mongoose.Schema.ObjectId,
          ref: 'question',
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
    subjectId: {
      type: mongoose.Schema.ObjectId,
      ref: 'subject',
    },
    pastQuestionCategoryId: {
      type: Number,
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
