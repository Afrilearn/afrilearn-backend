import {
  Router
} from "express";
import upload from "../config/bucket";
import LessonController from "../controllers/lesson.controller";
import verifyToken from "../middlewares/auth.middleware";
import SaveQuizResults from "../validations/results/quizResults.validator";
import ResumePlaying from "../validations/lessons/resumePlaying.validator";

const router = Router();

router.get("/", LessonController.getAllLessons);
router.get("/:lessonId/test", LessonController.loadTest);
router.post(
  "/:lessonId/save-test-results",
  SaveQuizResults.validateData(),
  SaveQuizResults.myValidationResult,
  verifyToken,
  LessonController.saveTestResult
);
router.get(
  "/:lessonId/get-test-results",
  verifyToken,
  LessonController.getTestResult
);
router.post("/search/:keywords", LessonController.searchLessons);
router.post(
  "/:courseId/:subjectId/subject-lessons",
  LessonController.getSubjectLessonsAndProgress
);
router.patch("/:lessonId/update", LessonController.updateLesson);
router.get("/:lessonId/", LessonController.getSingleLesson);
router.post("/storeUnFinishedVideos", ResumePlaying.validateData(), ResumePlaying.myValidationResult, LessonController.storeUnFinishedVideos);
router.post("/clearUnFinishedVideos", ResumePlaying.validateData(), ResumePlaying.myValidationResult, LessonController.clearUnFinishedVideos);
export default router;