import mongoose from "mongoose";

const EnrolledCourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    status: {
      type: String,
      default: "trial",
    },
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: "class",
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: "course",
    },
    startDate: {
      type: Date,
      default: new Date(),
    },
    endDate: {
      type: Date,
      default: new Date(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

EnrolledCourseSchema.virtual("transaction", {
  ref: "Transaction",
  localField: "_id",
  foreignField: "enrolledCourseId",
  justOne: true,
});

EnrolledCourseSchema.methods.toJSON = function () {
  const enrolledCourse = this;
  const enrolledCourseObject = enrolledCourse.toObject();
  enrolledCourseObject.paymentIsActive =
    enrolledCourseObject.endDate > Date.now();
  return enrolledCourseObject;
};

const EnrolledCourse = mongoose.model("enrolledCourse", EnrolledCourseSchema);

export default EnrolledCourse;
