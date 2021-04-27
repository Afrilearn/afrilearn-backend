import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.ObjectId,
      ref: "subject",
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: "course",
    },
    creatorId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    termId: {
      type: mongoose.Schema.ObjectId,
      ref: "term",
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    videoUrls: [
      {
        videoUrl: {
          type: String,
        },
        transcript: {
          type: String,
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

LessonSchema.virtual("questions", {
  ref: "question",
  localField: "_id",
  foreignField: "lessonId",
  justOne: false,
});

// LessonSchema.virtual("recommended").get(async function () {
//   console.log("lesson", this);
//   const lessons = await Lesson.find({
//     courseId: this.courseId,
//     subjectId: this.subjectId,
//   });
//   console.log("lessons", lessons);
//   const otherLessons = lessons.filter((item) => item._id !== this._id);
//   console.log("otherLessons", otherLessons);
//   const randomLesson = otherLessons[0];
//   console.log("randomLesson", randomLesson);

//   return randomLesson._id;
// });

// LessonSchema.method.toJSON = async function () {
//   const lesson = this;
//   const lessonObject = lesson.toObject();
//   console.log("lesson", lessonObject);
//   const lessons = await Lesson.find({
//     courseId: lessonObject.courseId,
//     subjectId: lessonObject.subjectId,
//   });
//   console.log("lessons", lessons);
//   const otherLessons = lessons.filter((item) => item._id !== lessonObject._id);
//   console.log("otherLessons", otherLessons);
//   const randomLesson = otherLessons[0];
//   console.log("randomLesson", randomLesson);
//   lessonObject.recommended = randomLesson._id;
//   return lessonObject;
// };
const Lesson = mongoose.model("lesson", LessonSchema);

export default Lesson;
