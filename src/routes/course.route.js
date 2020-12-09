import { Router } from 'express';
import CourseController from '../controllers/course.controller';
import validateToken from '../middlewares/auth.middleware';
import SubjectProgressValidator from '../validations/course/subjectProgress.validator';

const router = Router();

router.get('/', CourseController.loadCourses);
router.get('/:courseId', CourseController.getCourse);
router.get('/:courseId/subjects', CourseController.getSubjectsForACourse);
router.post(
  '/add-course',
  validateToken,
  CourseController.addCourseToEnrolledCourses,
);
router.post(
  '/subject-progress',
  validateToken,
  SubjectProgressValidator.validateData(),
  SubjectProgressValidator.myValidationResult,
  SubjectProgressValidator.progressExist,  
  CourseController.subjectProgress,
);

export default router;
