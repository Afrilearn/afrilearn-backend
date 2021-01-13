import mongoose from 'mongoose';

const EnrolledCourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    status: {
      type: String,
      default: 'trial',
    },
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: 'class',
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'course',
    },
    startDate: {
      type: Date,
      default: Date.now(),
    },
    endDate: {
      type: Date,
      default: new Date().setHours(48),
    },
  },
  { timestamps: true },
);

const EnrolledCourse = mongoose.model('enrolledCourse', EnrolledCourseSchema);

export default EnrolledCourse;
