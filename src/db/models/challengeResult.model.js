import mongoose from "mongoose";

const ChallengeResultSchema = new mongoose.Schema(
  {
    level_speed: [
      {
        level: {
          type: String,
        },
        time: {
          type: Number,
        },
      },
    ],
    overall_speed: {
      type: Number,
    },
    score: {
      type: Number,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const ChallengeResult = mongoose.model(
  "ChallengeResult",
  ChallengeResultSchema
);

export default ChallengeResult;
