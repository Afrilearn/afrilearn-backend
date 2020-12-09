import mongoose from 'mongoose';

const RecentActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['quiz', 'lesson', 'class'],
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'lesson',
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'question',
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'class',
    },
  },
  { timestamps: true },
);

const RecentActivity = mongoose.model('recentActivity', RecentActivitySchema);

export default RecentActivity;
