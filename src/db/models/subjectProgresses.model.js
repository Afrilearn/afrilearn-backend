import mongoose from 'mongoose';

const SubjectProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'class',
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'course',
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'subject',
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
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
