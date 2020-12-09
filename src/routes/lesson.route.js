import { Router } from 'express';
import LessonController from '../controllers/lesson.controller';
import verifyToken from '../middlewares/auth.middleware';
import SaveQuizResults from '../validations/results/quizResults.validator';
// import authRouter from './auth.route';

const router = Router();

router.get('/:lessonId/test', LessonController.loadTest);
router.post(
  '/:lessonId/save-test-results',
  SaveQuizResults.validateData(),
  SaveQuizResults.myValidationResult,
  verifyToken,
  LessonController.saveTestResult,
);
router.get(
  '/:lessonId/get-test-results',
  verifyToken,
  LessonController.getTestResult,
);
// /lessons?searchQuery=Radiaoactivity
router.get('/', LessonController.searchLessons);

export default router;
