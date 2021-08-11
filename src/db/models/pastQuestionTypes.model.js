import mongoose from 'mongoose';

const pastQuestionTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String, // exam_id on exam platform
    },
    imageUrl: {
      type: String,
      default: 'https://afrilearn-media.s3.eu-west-3.amazonaws.com/past-question-images/ic_launcher_round.png'
    },
    description:{
      type: String,
      default: 'Practice to multiply your success 13,000+ questions per subject'
    }    
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true 
  },
);

const PastQuestionType = mongoose.model(
  'pastQuestionType',
  pastQuestionTypeSchema,
);

export default PastQuestionType;
