import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    name: {
      type: String,
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'course',
    },
    classCode: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true },
);

ClassSchema.virtual('classAnnouncements', {
  ref: 'announcement',
  localField: '_id',
  foreignField: 'classId',
  justOne: false,
});

ClassSchema.virtual('relatedSubjects', {
  ref: 'subject',
  localField: 'courseId',
  foreignField: 'courseId',
  justOne: false,
});

ClassSchema.virtual('classMembers', {
  ref: 'classMember',
  localField: '_id',
  foreignField: 'classId',
  justOne: false,
});

ClassSchema.virtual('relatedPastQuestions', {
  ref: 'RelatedPastQuestion',
  localField: 'courseId',
  foreignField: 'courseId',
  justOne: false,
});

ClassSchema.virtual('teacherAssignedContents', {
  ref: 'teacherAssignedContent',
  localField: '_id',
  foreignField: 'classId',
  justOne: false,
});

ClassSchema.virtual('enrolledCourse', {
  ref: 'enrolledCourse',
  localField: '_id',
  foreignField: 'classId',
  justOne: true,
});

const Class = mongoose.model('class', ClassSchema);

export default Class;
