import mongoose from "mongoose";
import random from "mongoose-simple-random";

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
    bank: {
      type: String,
    },
    bankId: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    accountName: {
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
    parentId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    schoolId: {
      type: mongoose.Schema.ObjectId,
      ref: "school",
    },
    googleUserId: {
      type: String,
      trim: true,
    },
    referralLink: {
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
    isAdmin: {
      type: Boolean,
      default: false,
    },
    followings: {
      type: Array,
    },
    followers: {
      type: Array,
    },
    afriCoins: {
      type: Number,
      default: 100,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

UserSchema.plugin(random);
UserSchema.virtual("usersReferred", {
  ref: "user",
  localField: "_id",
  foreignField: "referee",
  justOne: false,
});
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
UserSchema.virtual("adminRoles", {
  ref: "adminRole",
  localField: "_id",
  foreignField: "userId",
  justOne: false,
});
UserSchema.virtual("schoolOwnership", {
  ref: "school",
  localField: "_id",
  foreignField: "creator",
  justOne: false,
});

const User = mongoose.model("user", UserSchema);

export default User;
