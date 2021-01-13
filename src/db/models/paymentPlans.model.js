import mongoose from 'mongoose';

const PaymentPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    amount: {
      type: Number,
    },
    duration: {
      type: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true },
);

const PaymentPlan = mongoose.model('paymentPlan', PaymentPlanSchema);

export default PaymentPlan;
