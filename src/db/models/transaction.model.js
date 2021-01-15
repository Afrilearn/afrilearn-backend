import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    tx_ref: {
      type: String,
    },
    amount: {
      type: Number,
    },
    flutterWaveResponse: {
      type: Object,
    },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed'],
      default: 'pending',
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    enrolledCourseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'enrolledCourse',
    },
    paymentPlanId: {
      type: mongoose.Schema.ObjectId,
      ref: 'paymentPlan',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true },
);

TransactionSchema.virtual('relatedEnrolledCourse', {
  ref: 'enrolledCourse',
  localField: 'enrolledCourseId',
  foreignField: '_id',
  justOne: false,
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;
