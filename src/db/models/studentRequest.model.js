import mongoose from "mongoose";

const StudentRequestSchema = new mongoose.Schema(
  {
    email: { type: String },
    attachment: { type: String },
    question: { type: String },
    phone: { type: String },
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

const StudentRequest = mongoose.model("StudentRequest", StudentRequestSchema);

export default StudentRequest;
