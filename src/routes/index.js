import { Router } from 'express';
import courseRouter from './course.route';
import authRouter from './auth.route';
import classRouter from './class.route';
import lessonRouter from './lesson.route';
import supportRouter from './support.route';
import recentRouter from './recentActivity.route';
import subjectRouter from './subject.route';
import countRouter from './count.route';
import pastQuestionRouter from './pastQuestion.route';
import paymentRouter from './payment.route';
import termRouter from './term.route';
import dashboardRouter from './dashboard.route';

const router = Router();

router.use('/courses', courseRouter);
router.use('/auth', authRouter);
router.use('/recents', recentRouter);
router.use('/counts', countRouter);
router.use('/subjects', subjectRouter);
router.use('/supports', supportRouter);
router.use('/lessons', lessonRouter);
router.use('/classes', classRouter);
router.use('/past-questions', pastQuestionRouter);
router.use('/dashboard', dashboardRouter);
router.use('/terms', termRouter);
router.use('/payments', paymentRouter);

export default router;
