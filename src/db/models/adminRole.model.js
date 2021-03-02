import mongoose from "mongoose";

const AdminRoleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);

const AdminRole = mongoose.model("adminRole", AdminRoleSchema);

export default AdminRole;
