import mongoose from 'mongoose';

const RecentActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['quiz', 'lesson'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'lesson',
    },
  },
  { timestamps: true },
);

const RecentActivity = mongoose.model('recentActivity', RecentActivitySchema);

export default RecentActivity;
