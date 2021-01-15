import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      required: true,
    },
    text: {
      type: String,
    },
    classId: {
      type: mongoose.Schema.ObjectId,
      ref: 'class',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true },
);

AnnouncementSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'announcementId',
  justOne: false,
});

const Announcement = mongoose.model('announcement', AnnouncementSchema);

export default Announcement;
