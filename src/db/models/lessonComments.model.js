import mongoose from "mongoose";

const LessonCommentSchema = new mongoose.Schema(
  {    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },  
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lesson",
    },
    text: {
      type: String,
      required: true     
    },
    commentSection:{
      type: String,
      enum: ["video", "note"],
      default: "video"
    },
    likes: [{
      type: String
    }],    
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

LessonCommentSchema.virtual("commentReplies", {
  ref: "lessonCommentReplies",
  localField: "_id",
  foreignField: "lessonCommentId",
  justOne: false,
});

const lessonComment = mongoose.model("lessonComment", LessonCommentSchema);

export default lessonComment;
