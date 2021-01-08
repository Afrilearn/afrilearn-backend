import mongoose from 'mongoose';

const pastQuestionTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true },
);

const PastQuestionType = mongoose.model(
  'pastQuestionType',
  pastQuestionTypeSchema,
);

export default PastQuestionType;
