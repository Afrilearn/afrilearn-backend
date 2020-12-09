import { Router } from 'express';
import CourseController from '../controllers/course.controller';
import validateToken from '../middlewares/auth.middleware';
import AddEnrolledCourseValidator from '../validations/courses/addEnrolledCourse.validator';
// import authRouter from './auth.route';

const router = Router();

router.get('/', CourseController.loadCourses);
router.get('/:courseId', CourseController.getCourse);
router.get('/:courseId/subjects', CourseController.getSubjectsForACourse);
router.post(
  '/add-course',
  validateToken,
  AddEnrolledCourseValidator.validateData(),
  AddEnrolledCourseValidator.myValidationResult,
  CourseController.addCourseToEnrolledCourses,
);

export default router;
