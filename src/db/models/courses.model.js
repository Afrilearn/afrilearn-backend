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
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true },
);

courseSchema.virtual('relatedPastQuestions', {
  ref: 'RelatedPastQuestion',
  localField: '_id',
  foreignField: 'courseId',
  justOne: false,
});
courseSchema.virtual('relatedSubjects', {
  ref: 'subject',
  localField: '_id',
  foreignField: 'courseId',
  justOne: false,
});

const Course = mongoose.model('course', courseSchema);

export default Course;
