import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema(
  {
    mainSubjectId: {
      type: mongoose.Schema.ObjectId,
      ref: 'mainSubject',
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'course',
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
SubjectSchema.virtual('mainSubjects', {
  ref: 'mainSubject',
  localField: '_id',
  foreignField: 'mainSubjectId',
});

const Subject = mongoose.model('subject', SubjectSchema);

export default Subject;
