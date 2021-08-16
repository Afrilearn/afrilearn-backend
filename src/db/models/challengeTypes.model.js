import mongoose from "mongoose";

const ChallengeTypeSchema = new mongoose.Schema(
  {
    name: { type: String },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const ChallengeType = mongoose.model("challengeType", ChallengeTypeSchema);

export default ChallengeType;
