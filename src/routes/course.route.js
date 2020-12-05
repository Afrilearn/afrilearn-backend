import { Router } from 'express';
import CourseController from '../controllers/course.controller';

const router = Router();

router.get('/', CourseController.loadCourses);
router.get('/:courseId', CourseController.getCourse);

export default router;
