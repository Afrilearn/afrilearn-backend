import mongoose from "mongoose";

const AdminRoleSchema = new mongoose.Schema(
  {
    roleDescription: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
  },
);

const AdminRole = mongoose.model("adminRole", AdminRoleSchema);

export default AdminRole;
