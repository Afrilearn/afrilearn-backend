import mongoose from 'mongoose';

const courseCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    }  
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true 
  },
);

const CourseCategory = mongoose.model('courseCategory', courseCategorySchema);

export default CourseCategory;
