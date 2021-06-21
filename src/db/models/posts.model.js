import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "followersOnly"],
      default: "public",
    },
    text: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    courseName: {
      type: String,
    },
    subjectName: {
      type: String,
    },
    lessonName: {
      type: String,
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: "course",
    },
    subjectId: {
      type: mongoose.Schema.ObjectId,
      ref: "subject",
    },
    lessonId: {
      type: mongoose.Schema.ObjectId,
      ref: "lesson",
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

PostSchema.virtual("comments", {
  ref: "PostComment",
  localField: "_id",
  foreignField: "postId",
  justOne: false,
});

const Post = mongoose.model("Post", PostSchema);

export default Post;
