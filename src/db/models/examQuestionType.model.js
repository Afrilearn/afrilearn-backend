import mongoose from "mongoose";

const examQuestionTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    creatorId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const ExamQuestionType = mongoose.model(
  "examQuestionType",
  examQuestionTypeSchema
);

export default ExamQuestionType;
