import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: "class",
    },
    subjectId: {
      type: mongoose.Schema.ObjectId,
      ref: "subject",
    },
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: "class",
    },
    termId: {
      type: mongoose.Schema.ObjectId,
      ref: "term",
    },
    title: {
      type: String,
    },
    questionTypeId: {
      type: mongoose.Schema.ObjectId,
      ref: "examQuestionType",
    },
    duration: {
      type: Number,
    },
    instruction: {
      type: String,
    },
    totalNumberOfQuestions: {
      type: Number,
    },
    creatorId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    deadline: {
      type: Date,
    },
    publish: {
      type: Boolean,
      default: true,
    },
    participants: {
      type: Array,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);
examSchema.virtual("questions", {
  ref: "examQuestion",
  localField: "_id",
  foreignField: "examId",
  justOne: false,
});
examSchema.virtual("results", {
  ref: "examResult",
  localField: "_id",
  foreignField: "examId",
  justOne: false,
});
examSchema.virtual("resultsCount", {
  ref: "examResult",
  localField: "_id",
  foreignField: "examId",
  count: true,
});

const Exam = mongoose.model("exam", examSchema);

export default Exam;
