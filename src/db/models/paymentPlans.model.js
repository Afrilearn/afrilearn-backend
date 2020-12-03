import mongoose from 'mongoose';

const PaymentPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    amount: {
      type: Number,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const PaymentPlan = mongoose.model('paymentPlan', PaymentPlanSchema);

export default PaymentPlan;
