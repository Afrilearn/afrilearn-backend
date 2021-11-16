import mongoose from "mongoose";

const AppPinSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const AppPin = mongoose.model("AppPin", AppPinSchema);

export default AppPin;
