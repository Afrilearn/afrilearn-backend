import mongoose from "mongoose";

const studentRequestReplySchema = new mongoose.Schema(
  {
    email: { type: String },
    attachment: { type: String },
    body: { type: String },
    phone: { type: String },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentRequest",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    courseId: {
      type: String,
    },
    subjectId: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const studentRequestReply = mongoose.model(
  "studentRequestReply",
  studentRequestReplySchema
);

export default studentRequestReply;
