import mongoose from 'mongoose';

const QuizResultsSchema = new mongoose.Schema(
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
    lessonId: {
      type: mongoose.Schema.ObjectId,
      ref: 'lesson',
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
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const QuizResult = mongoose.model('quizResult', QuizResultsSchema);

export default QuizResult;
