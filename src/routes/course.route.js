import { Router } from 'express';
import CourseController from '../controllers/course.controller';
import validateToken from '../middlewares/auth.middleware';
import AddEnrolledCourseValidator from '../validations/courses/addEnrolledCourse.validator';
// import authRouter from './auth.route';
import SubjectProgressValidator from '../validations/courses/subjectProgress.validator';

const router = Router();

router.get('/', CourseController.loadCourses);
router.get('/:courseId', CourseController.getCourse);
router.get(
  '/:courseId/progress-and-performance',
  validateToken,
  CourseController.getCourseProgressAndPerformance,
);
router.get('/:courseId/subjects', CourseController.getSubjectsForACourse);
router.post(
  '/enroll',
  AddEnrolledCourseValidator.validateData(),
  AddEnrolledCourseValidator.myValidationResult,
  CourseController.addCourseToEnrolledCourses,
);
router.post(
  '/subject-progress',
  validateToken,
  SubjectProgressValidator.validateData(),
  SubjectProgressValidator.myValidationResult,
  // SubjectProgressValidator.progressExist,
  CourseController.subjectProgress,
);

export default router;
