import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.ObjectId,
      ref: 'subject',
    },
    termId: {
      type: mongoose.Schema.ObjectId,
      ref: 'term',
    },
    title: {
      type: String     
    },
    questionTypeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'examQuestionType',
    },
    duration: {
      type: Number     
    },
    instruction: {
      type: String     
    },
    totalNumberOfQuestions: {
      type: Number     
    },
    creatorId: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },    
    deadline:{
      type: Date 
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true 
  }, 
);

const exam = mongoose.model('exam', examSchema);

export default exam;
