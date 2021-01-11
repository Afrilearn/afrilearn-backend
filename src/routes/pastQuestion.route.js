import { Router } from 'express';
import PastQuestionController from '../controllers/pastQuestion.countroller';
import verifyToken from '../middlewares/auth.middleware';
import AddPastQuestionProgressValidator from '../validations/pastQuestions/addPastQuestionsProgress.validator';

const router = Router();

// router.get('/:lessonId/test', LessonController.loadTest);
// router.post(
//   '/:lessonId/save-test-results',
//   SaveQuizResults.validateData(),
//   SaveQuizResults.myValidationResult,
//   verifyToken,
//   LessonController.saveTestResult,
// );
// router.get(
//   '/:lessonId/get-test-results',
//   verifyToken,
//   LessonController.getTestResult,
// );
// router.get('/', LessonController.searchLessons);
router.post(
  '/add-progress',
  verifyToken,
  AddPastQuestionProgressValidator.validateData(),
  AddPastQuestionProgressValidator.myValidationResult,
  PastQuestionController.addPastQuestionProgress,
);

export default router;
