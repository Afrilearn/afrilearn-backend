import mongoose from 'mongoose';

const classCourseSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: 'class',
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'course',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
  },
);

const ClassCourse = mongoose.model('classCourse', classCourseSchema);

export default ClassCourse;
