import mongoose from 'mongoose';

const PastQuestionProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: 'class',
    },
    pastQuestionTypeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'pastQuestionType',
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'course',
    },
    subjectId: {
      type: mongoose.Schema.ObjectId,
      ref: 'subject',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true },
);

const PastQuestionProgress = mongoose.model(
  'pastQuestionProgress',
  PastQuestionProgressSchema,
);

export default PastQuestionProgress;
