import mongoose from "mongoose";

const DuelResultSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "challenge",
    },
    hostResult: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      totalQuestions: {
        type: Number,
      },
      totalQuestionsAnswered: {
        type: Number,
      },
      numOfCorrectAnswers: {
        type: Number,
      },
      winRatio: {
        type: Number,
      },
      averageSpeed: {
        type: Number,
      },
    },
    guestResult: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      totalQuestions: {
        type: Number,
      },
      totalQuestionsAnswered: {
        type: Number,
      },
      numOfCorrectAnswers: {
        type: Number,
      },
      winRatio: {
        type: Number,
      },
      averageSpeed: {
        type: Number,
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const DuelResult = mongoose.model("DuelResult", DuelResultSchema);

export default DuelResult;
