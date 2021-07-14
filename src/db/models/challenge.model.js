import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema(
  {
    subjects: [
      {
        name: {
          type: String,
        },
        questions: {
          type: Array,
        },
      },
    ],
    type: {
      type: String,
      enum: ["school", "class", "student", "exam"],
    },
    examCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pastQuestionType",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    entry_fee: { type: Number },
    prize: { type: Number },
    description: { type: String },
    winner_instruction: { type: String },
    deadline: { type: String },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const Challenge = mongoose.model("Challenge", ChallengeSchema);

export default Challenge;
