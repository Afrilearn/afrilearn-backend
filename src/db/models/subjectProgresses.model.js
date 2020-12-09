import mongoose from 'mongoose';

const SubjectProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: 'class',
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'course',
    },
    subjectId: {
      type: mongoose.Schema.ObjectId,
      ref: 'subject',
    },
    lessonId: {
      type: mongoose.Schema.ObjectId,
      ref: 'subject',
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const SubjectProgress = mongoose.model(
  'subjectProgress',
  SubjectProgressSchema,
);

export default SubjectProgress;
