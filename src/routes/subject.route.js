import { Router } from 'express';
import SubjectController from '../controllers/subject.controller';
import AddSubject from '../validations/subject/addSubject.validator';
// import authRouter from './auth.route';

const router = Router();

router.get('/', SubjectController.getSubjects);
router.post(
  '/add-subject',
  AddSubject.validateData(),
  AddSubject.myValidationResult,
  SubjectController.addSubject,
);
export default router;
