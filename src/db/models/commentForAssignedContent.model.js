import mongoose from 'mongoose';

const CommentForAssignedContentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    text: {
      type: String,
    },
    teacherAssignedContentId: {
      type: mongoose.Schema.ObjectId,
      ref: 'teacherAssignedContent',
      required: true,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const CommentForAssignedContent = mongoose.model(
  'CommentForAssignedContent',
  CommentForAssignedContentSchema,
);

export default CommentForAssignedContent;
