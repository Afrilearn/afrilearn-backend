import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      default: 'password',
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
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'role',
      required: true,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    profilePhotoUrl: {
      type: String,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const User = mongoose.model('user', UserSchema);

export default User;
