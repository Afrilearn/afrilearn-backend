import mongoose from "mongoose";

const UserStorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    fileURL: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const UserStory = mongoose.model("UserStory", UserStorySchema);

export default UserStory;