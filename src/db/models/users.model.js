import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      unique: true,
      trim: true,
    },
    googleUserId: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
    },
    country: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    dayOfBirth: {
      type: Number,
    },
    monthOfBirth: {
      type: String,
    },
    yearOfBirth: {
      type: Number,
    },
    userLocation: {
      type: String,
    },
    education: {
      type: String,
    },
    guardianName: {
      type: String,
    },
    guardianEmail: {
      type: String,
    },
    guardianPhone: {
      type: String,
    },
    primarySport: {
      type: String,
    },
    academyName: {
      type: String,
    },
    yearEstablished: {
      type: Number,
    },
    biography: {
      type: String,
    },
    role: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    coverPhotoUrl: {
      type: String,
    },
    profilePhotoUrl: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const User = mongoose.model('user', UserSchema);

export default User;
