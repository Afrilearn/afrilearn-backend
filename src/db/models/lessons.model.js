import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.ObjectId,
      ref: 'subject',
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'course',
    },
    creatorId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    termId: {
      type: mongoose.Schema.ObjectId,
      ref: 'term',
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    videoUrls: [
      {
        videoUrl: {
          type: String,
        },
        transcript: {
          type: String,
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true },
);

LessonSchema.virtual('questions', {
  ref: 'question',
  localField: '_id',
  foreignField: 'lessonId',
  justOne: false,
});

const Lesson = mongoose.model('lesson', LessonSchema);

export default Lesson;
