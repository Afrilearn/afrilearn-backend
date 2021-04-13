import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    text: {
      type: String,
    },
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: "class",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: { createdAt: false, updatedAt: true }
  },
);

announcementSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "announcementId",
  justOne: false,
});

const Announcement = mongoose.model("announcement", announcementSchema);

export default Announcement;
