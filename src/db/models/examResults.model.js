import mongoose from 'mongoose';

const ExamResultsSchema = new mongoose.Schema(
  {
    results: [
      {
        questionId: {
          type: mongoose.Schema.ObjectId,
          ref: 'examQuestion',
        },
        optionSelected: {
          type: Number,
        },
        correctOption: {
          type: Number,
        }       
      },
    ],
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    examId: {
      type: mongoose.Schema.ObjectId,
      ref: 'exam',
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
    timestamps: true 
  },
);

const ExamResult = mongoose.model('examResult', ExamResultsSchema);

export default ExamResult;
