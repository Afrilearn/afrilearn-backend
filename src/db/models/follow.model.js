import mongoose from "mongoose";

const FollowSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    userId: {
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

const Follow = mongoose.model("Follow", FollowSchema);

export default Follow;
