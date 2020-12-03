import mongoose from 'mongoose';

const courseCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const CourseCategory = mongoose.model('courseCategory', courseCategorySchema);

export default CourseCategory;
