import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Role = mongoose.model('role', RoleSchema);

export default Role;
