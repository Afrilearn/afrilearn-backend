import mongoose from "mongoose";

const AfriCoinPaymentPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    amount: {
      type: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const AfriCoinPaymentPlan = mongoose.model(
  "AfriCoinPaymentPlan",
  AfriCoinPaymentPlanSchema
);

export default AfriCoinPaymentPlan;
