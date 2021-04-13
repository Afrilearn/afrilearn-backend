import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      required: true,
    },
    text: {
      type: String,
    },
    announcementId: {
      type: mongoose.Schema.ObjectId,
      ref: 'announcement',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
  },
);

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;
