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
    classification: {
      type: String,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const MainSubject = mongoose.model('mainSubject', mainSubjectSchema);

export default MainSubject;
