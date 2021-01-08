import mongoose from 'mongoose';

const relatedpastQuestionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'course',
    },
    pastQuestionTypeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'pastQuestionType',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true },
);

relatedpastQuestionSchema.virtual('pastQuestionTypes', {
  ref: 'pastQuestionType',
  localField: 'pastQuestionTypeId',
  foreignField: '_id',
  justOne: false,
});

const RelatedPastQuestion = mongoose.model(
  'RelatedPastQuestion',
  relatedpastQuestionSchema,
);

export default RelatedPastQuestion;
