import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'lesson',
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    question: {
      type: String,
    },
    questionImage: {
      type: String,
    },
    imagePosition: {
      type: String,
    },
    optionA: {
      type: String,
    },
    optionAImage: {
      type: String,
    },
    optionB: {
      type: String,
    },
    optionBImage: {
      type: String,
    },
    optionC: {
      type: String,
    },
    optionCImage: {
      type: String,
    },
    optionD: {
      type: String,
    },
    optionDImage: {
      type: String,
    },
    optionE: {
      type: String,
    },
    optionEImage: {
      type: String,
    },
    correctOption: {
      type: Number,
    },
    explanation: {
      type: String,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Question = mongoose.model('question', QuestionSchema);

export default Question;
