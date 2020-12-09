import mongoose from 'mongoose';

const classMemberSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: 'class',
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true } 
);

const ClassMember = mongoose.model('classMember', classMemberSchema);

export default ClassMember;
