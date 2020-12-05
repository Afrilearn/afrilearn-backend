import { Router } from 'express';
import SubjectController from '../controllers/subject.controller';

const router = Router();

router.get('/:courseId/subjects', SubjectController.getSubjectsForACourse);

export default router;
