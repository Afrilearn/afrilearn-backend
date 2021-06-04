import mongoose from "mongoose";

const ResumePlayingSchema = new mongoose.Schema(
  {    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subject",
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lesson",
    },
    termId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "term",
    }   
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const ResumePlaying = mongoose.model("resumePlaying", ResumePlayingSchema);

export default ResumePlaying;
