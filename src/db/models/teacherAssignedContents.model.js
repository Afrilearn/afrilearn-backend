import mongoose from 'mongoose';

const teacherAssignedContentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
    },
    lessonId: {
      type: mongoose.Schema.ObjectId,
      ref: 'lesson',
    },
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: 'class',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true },
);

const TeacherAssignedContent = mongoose.model(
  'teacherAssignedContent',
  teacherAssignedContentSchema,
);

export default TeacherAssignedContent;
