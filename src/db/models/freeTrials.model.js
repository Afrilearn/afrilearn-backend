import mongoose from 'mongoose';

const FreeTrialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: 'class',
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'course',
    },
    duration: {
      type: Number,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
  },
);

const FreeTrial = mongoose.model('freeTrial', FreeTrialSchema);

export default FreeTrial;
