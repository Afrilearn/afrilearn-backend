import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      unique: true,
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
      type: String,
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
