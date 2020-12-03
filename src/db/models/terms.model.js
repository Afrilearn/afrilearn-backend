import mongoose from 'mongoose';

const TermSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Term = mongoose.model('term', TermSchema);

export default Term;
