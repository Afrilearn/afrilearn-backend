import mongoose from "mongoose";

const CommentLikeSchema = new mongoose.Schema(
  {
    commentId: {
      type: mongoose.Schema.ObjectId,
      ref: "PostComment",
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

const CommentLike = mongoose.model("CommentLike", CommentLikeSchema);

export default CommentLike;
