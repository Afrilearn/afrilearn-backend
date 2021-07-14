import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["accepted", "rejected", "won", "eliminated"],
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
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

const Participant = mongoose.model("Participant", ParticipantSchema);

export default Participant;
