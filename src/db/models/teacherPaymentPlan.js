import mongoose from "mongoose";

const TeacherPaymentPlanSchema = new mongoose.Schema(
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
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "role",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const TeacherPaymentPlan = mongoose.model(
  "TeacherPaymentPlan",
  TeacherPaymentPlanSchema
);

export default TeacherPaymentPlan;
