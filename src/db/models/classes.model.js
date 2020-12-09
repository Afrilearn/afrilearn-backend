import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    name: {
      type: String,
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'course',
    },
    classCode: {
      type: String,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Class = mongoose.model('class', ClassSchema);

export default Class;
