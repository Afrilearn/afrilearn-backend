import { Router } from "express";
import upload from "../config/bucket";
import LessonController from "../controllers/lesson.controller";
import verifyToken from "../middlewares/auth.middleware";
import SaveQuizResults from "../validations/results/quizResults.validator";

const router = Router();

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
router.get("/", LessonController.searchLessons);
router.post(
  "/:courseId/:subjectId/subject-lessons",
  LessonController.getSubjectLessonsAndProgress
);
router.patch(
  "/:lessonId/update",
  upload.single("videoUrl"),
  LessonController.updateLesson
);

export default router;
