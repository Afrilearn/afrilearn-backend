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
  { timestamps: true }
);

const TeacherAssignedContent = mongoose.model(
  "teacherAssignedContent",
  teacherAssignedContentSchema
);

export default TeacherAssignedContent;
