import mongoose from 'mongoose';

const pastQuestionTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String, // exam_id on exam platform
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
