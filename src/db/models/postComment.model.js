import mongoose from "mongoose";

const PostCommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    postId: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
    text: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    likes: {
      type: Array,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const PostComment = mongoose.model("PostComment", PostCommentSchema);

export default PostComment;
