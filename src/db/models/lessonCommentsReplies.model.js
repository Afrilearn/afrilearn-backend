import mongoose from "mongoose";

const LessonCommentRepliesSchema = new mongoose.Schema(
  {    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    lessonCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lessonComment",
    },   
    text: {
      type: String,
      required: true     
    }    
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const lessonCommentReplies = mongoose.model("lessonCommentReplies", LessonCommentRepliesSchema);

export default lessonCommentReplies;
