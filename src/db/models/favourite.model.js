import mongoose from "mongoose";

const FavouriteSchema = new mongoose.Schema(
  {    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subject",
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lesson",
    },
    termId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "term",
    },
    videoId: {
      type: String      
    },
    videoPosition: {
      type: String     
    }         
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const Favourite = mongoose.model("favorite", FavouriteSchema);

export default Favourite;
