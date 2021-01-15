import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      required: true,
    },
    type: {
      type: String,
      enum: ['quiz', 'lesson'],
    },
    recommended: {
      type: mongoose.Schema.ObjectId,
      ref: 'lesson',
    },
    reason: {
      type: mongoose.Schema.ObjectId,
      ref: 'lesson',
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Recommendation = mongoose.model('recommendation', RecommendationSchema);

export default Recommendation;
