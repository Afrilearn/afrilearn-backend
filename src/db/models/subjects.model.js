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
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true },
);

SubjectSchema.virtual('mainSubjects', {
  ref: 'mainSubject',
  localField: '_id',
  foreignField: 'mainSubjectId',
});

SubjectSchema.virtual('quizResults', {
  ref: 'quizResult',
  localField: '_id',
  foreignField: 'subjectId',
});
SubjectSchema.virtual('relatedLessons', {
  ref: 'lesson',
  localField: '_id',
  foreignField: 'subjectId',
});
SubjectSchema.virtual('progresses', {
  ref: 'subjectProgress',
  localField: '_id',
  foreignField: 'subjectId',
});

const Subject = mongoose.model('subject', SubjectSchema);

export default Subject;
