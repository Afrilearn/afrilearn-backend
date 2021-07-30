import mongoose from "mongoose";

const ChallengeResultSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "challenge",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
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
    }   
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const ChallengeResult = mongoose.model(
  "challengeResult",
  ChallengeResultSchema
);

export default ChallengeResult;
