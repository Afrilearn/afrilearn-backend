import { Router } from 'express';
import SubjectController from '../controllers/subject.controller';
// import authRouter from './auth.route';

const router = Router();

router.get('/:courseId/subjects', SubjectController.getSubjectsForACourse);

export default router;
