import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema(
  {
   
    name: {
      type: String      
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    examblyPastQuestionExamId: {
      type: Number     
    },
    numberOfQuestions: {
      type: Number     
    },
    timeSpan: {
      type: Number     
    },
    entryFee: {
      type: Number     
    },
    prize: { 
      type: String
    },
    subjects: {
      type: String      
    },
    challengeImageUrl: { type: String },
    description: { type: String },    
    startDate: { 
      type: Date,
      default: new Date()
    },
    endDate: { 
      type: Date,
      default: new Date().setHours(168)
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const Challenge = mongoose.model("challenge", ChallengeSchema);

export default Challenge;
