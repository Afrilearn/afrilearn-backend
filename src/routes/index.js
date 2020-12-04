import { Router } from 'express';
import courseRouter from './course.route';
// import authRouter from './auth.route';

const router = Router();

router.use('/courses', courseRouter);
// router.use('/auth', authRouter);

export default router;
