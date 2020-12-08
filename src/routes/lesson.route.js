import { Router } from 'express';
import LessonController from '../controllers/lesson.controller';
// import authRouter from './auth.route';

const router = Router();

router.get('/:lessonId/test', LessonController.loadTest);

export default router;
