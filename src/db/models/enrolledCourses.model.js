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
    schoolId: {
      type: mongoose.Schema.ObjectId,
      ref: "school",
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

export const primaryCoursesIds = [
  "5fc8cfbb81a55b4c3c19737d",
  "5fd12c70e74b15663c5f4c6e",
  "5fff5a67de0bdb47f826fea8",
  "5fff5a7ede0bdb47f826fea9",
  "5fff5aaede0bdb47f826feaa",
  "5fff5abede0bdb47f826feab",
];

EnrolledCourseSchema.methods.toJSON = function () {
  const enrolledCourse = this;
  const enrolledCourseObject = enrolledCourse.toObject();
  let isPrimary = false;
  if (
    enrolledCourseObject.courseId &&
    primaryCoursesIds.includes(enrolledCourseObject.courseId.toString())
  ) {
    isPrimary = true;
  }
  if (
    enrolledCourseObject.courseId &&
    enrolledCourseObject.courseId._id &&
    primaryCoursesIds.includes(enrolledCourseObject.courseId._id.toString())
  ) {
    isPrimary = true;
  }

  // enrolledCourseObject.paymentIsActive =
  //   isPrimary || enrolledCourseObject.endDate > Date.now();
  enrolledCourseObject.paymentIsActive = true
  return enrolledCourseObject;
};

const EnrolledCourse = mongoose.model("enrolledCourse", EnrolledCourseSchema);

export default EnrolledCourse;
