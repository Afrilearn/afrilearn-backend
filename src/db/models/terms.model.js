import mongoose from 'mongoose';

const TermSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.ObjectId,
      ref: "cmsUser"
    }    
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true 
  },
);

const Term = mongoose.model('term', TermSchema);

export default Term;
