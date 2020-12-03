import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema(
  {
    mainSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'mainSubject',
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'course',
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Subject = mongoose.model('subject', SubjectSchema);

export default Subject;
