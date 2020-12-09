import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    categoryId: {
      type: mongoose.Schema.ObjectId,
      ref: 'courseCategory',
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Course = mongoose.model('course', courseSchema);

export default Course;
