import mongoose from 'mongoose';

const SupportRequestSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    subject: {
      type: String,
    },
    content: {
      type: String,
    },
  },
  { timestamps: true },
);

const SupportRequest = mongoose.model('SupportRequest', SupportRequestSchema);

export default SupportRequest;
