import { Router } from 'express';
import CourseController from '../controllers/course.controller';
import validateToken from '../middlewares/auth.middleware';
// import authRouter from './auth.route';

const router = Router();

router.get('/', CourseController.loadCourses);
router.get('/:courseId', CourseController.getCourse);
router.get('/:courseId/subjects', CourseController.getSubjectsForACourse);
router.post(
  '/add-course',
  validateToken,
  CourseController.addCourseToEnrolledCourses,
);

export default router;
