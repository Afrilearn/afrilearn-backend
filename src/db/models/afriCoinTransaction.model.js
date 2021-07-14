import mongoose from "mongoose";

const AfriCoinTransactionSchema = new mongoose.Schema(
  {
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["add", "remove"],
    },
    amount: {
      type: Number,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const AfriCoinTransaction = mongoose.model(
  "AfriCoinTransaction",
  AfriCoinTransactionSchema
);

export default AfriCoinTransaction;
