import mongoose from 'mongoose';

const mainSubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    introText: {
      type: String,
    },
    creatorId: {
      type: mongoose.Schema.ObjectId,
      ref: 'cmsUser',
    },
    classification: {
      type: String,
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true 
  },
);

const MainSubject = mongoose.model('mainSubject', mainSubjectSchema);

export default MainSubject;
