import mongoose from "mongoose";

const teacherAssignedContentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    lessonId: {
      type: mongoose.Schema.ObjectId,
      ref: "lesson",
    },
    subjectId: {
      type: mongoose.Schema.ObjectId,
      ref: "subject",
    },
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: "class",
    },
    dueDate: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);

teacherAssignedContentSchema.virtual("comments", {
  ref: "CommentForAssignedContent",
  localField: "_id",
  foreignField: "teacherAssignedContentId",
  justOne: false,
});

const TeacherAssignedContent = mongoose.model(
  "teacherAssignedContent",
  teacherAssignedContentSchema
);

export default TeacherAssignedContent;
