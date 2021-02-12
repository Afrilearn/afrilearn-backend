import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: String,
    },
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    role: {
      type: mongoose.Schema.ObjectId,
      ref: "role",
    },
    googleUserId: {
      type: String,
      trim: true,
    },
    referralCode: {
      type: String,
      trim: true,
    },
    referee: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    profilePhotoUrl: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);

UserSchema.virtual("enrolledCourses", {
  ref: "enrolledCourse",
  localField: "_id",
  foreignField: "userId",
  justOne: false,
});

UserSchema.virtual("classMembership", {
  ref: "classMember",
  localField: "_id",
  foreignField: "userId",
  justOne: false,
});

UserSchema.virtual("classOwnership", {
  ref: "class",
  localField: "_id",
  foreignField: "userId",
  justOne: false,
});
UserSchema.virtual("recentActivities", {
  ref: "recentActivity",
  localField: "_id",
  foreignField: "userId",
  justOne: false,
});

const User = mongoose.model("user", UserSchema);

export default User;
