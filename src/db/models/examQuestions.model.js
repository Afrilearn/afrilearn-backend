import mongoose from "mongoose";

const ExamQuestionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.ObjectId,
      ref: "exam",
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    type: {
      type: String,
    },
    question: {
      type: String,
    },
    question_image: {
      type: String,
    },
    question_position: {
      type: String,
    },
    options: { type: Array },
    images: { type: Array },
    correct_option: {
      type: Number,
    },
    explanation: {
      type: String,
    },
    mark_weight: {
      type: Number,
      default:1
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const ExamQuestion = mongoose.model("examQuestion", ExamQuestionSchema);

export default ExamQuestion;
