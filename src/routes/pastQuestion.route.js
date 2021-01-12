import { Router } from 'express';
import PastQuestionController from '../controllers/pastQuestion.countroller';
import verifyToken from '../middlewares/auth.middleware';
import AddPastQuestionProgressValidator from '../validations/pastQuestions/addPastQuestionsProgress.validator';
import SavePastQuestionResults from '../validations/results/pastQuestionResults.validator';

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
// router.get(
//   "/:courseId/progress-and-performance",
//   verifyToken,
//   PastQuestionController.getPastQuestionProgressAndPerformance
// );
router.post(
  '/save-past-question-result',
  verifyToken,
  SavePastQuestionResults.validateData(),
  SavePastQuestionResults.myValidationResult,
  PastQuestionController.savePastQuestionResult,
);
router.post(
  '/add-progress',
  verifyToken,
  AddPastQuestionProgressValidator.validateData(),
  AddPastQuestionProgressValidator.myValidationResult,
  PastQuestionController.addPastQuestionProgress,
);

export default router;
