import { Router } from 'express';
import courseRouter from './course.route';
import authRouter from './auth.route';
import classRouter from './class.route';
import lessonRouter from './lesson.route';

const router = Router();

router.use('/courses', courseRouter);
router.use('/auth', authRouter);
router.use('/lessons', lessonRouter);
router.use('/classes', classRouter);

export default router;
