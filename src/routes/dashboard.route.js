import { Router } from 'express';
import DashboardController from '../controllers/dashboard.controller';
import validateToken from '../middlewares/auth.middleware';
import GetUserDashboard from '../validations/dashboard/getUserDashboard.validator';

const router = Router();

router.get(
  '/',
  validateToken,
  GetUserDashboard.validateData(),
  GetUserDashboard.myValidationResult,
  DashboardController.getUserDashboard,
);
// router.get('/:courseId', CourseController.getCourse);
// router.get(
//   '/:courseId/progress-and-performance',
//   validateToken,
//   CourseController.getCourseProgressAndPerformance,
// );
// router.get('/:courseId/subjects', CourseController.getSubjectsForACourse);
// router.post(
//   '/enroll',
//   AddEnrolledCourseValidator.validateData(),
//   AddEnrolledCourseValidator.myValidationResult,
//   CourseController.addCourseToEnrolledCourses,
// );
// router.post(
//   '/subject-progress',
//   validateToken,
//   SubjectProgressValidator.validateData(),
//   SubjectProgressValidator.myValidationResult,
//   SubjectProgressValidator.progressExist,
//   CourseController.subjectProgress,
// );

export default router;
