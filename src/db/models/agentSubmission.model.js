import mongoose from "mongoose";

const AgentSubmissionSchema = new mongoose.Schema(
  {
    fulName: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    state: {
      type: String,
    },
    file: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const AgentSubmission = mongoose.model(
  "AgentSubmission",
  AgentSubmissionSchema
);

export default AgentSubmission;
