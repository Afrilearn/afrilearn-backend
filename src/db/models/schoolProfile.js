import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    description: {
      type: String,
    },
    regNumber: {
      type: String,
    },
    phone: {
      type: String,
    },
    website: {
      type: String,
    },
    location: {
      type: String,
    },
    logo: {
      type: String,
      default:
        "https://afrilearn-media.s3.eu-west-3.amazonaws.com/dummy-images/schoolDummyLogo.png",
    },
    coverPhoto: {
      type: String,
    },
    courseCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseCategory",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);
SchoolSchema.virtual("admins", {
  ref: "adminRole",
  localField: "_id",
  foreignField: "school",
});
SchoolSchema.virtual("members", {
  ref: "user",
  localField: "_id",
  foreignField: "school",
});

const School = mongoose.model("school", SchoolSchema);

export default School;
