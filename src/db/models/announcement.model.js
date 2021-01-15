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
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Announcement = mongoose.model('announcement', AnnouncementSchema);

export default Announcement;
