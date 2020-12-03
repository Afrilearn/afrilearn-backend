import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'subject',
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'course',
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    termId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'term',
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Lesson = mongoose.model('lesson', LessonSchema);

export default Lesson;
