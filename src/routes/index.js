import { Router } from 'express';
import courseRouter from './course.route';
import authRouter from './auth.route';
import classRouter from './class.route';
import lessonRouter from './lesson.route';
// import EnrolledCourse from "../db/models/enrolledCourses.model";
const router = Router();

// const enr = new EnrolledCourse({
//   userId: "5fd0998b53a03f3900b7c2da",
//   classId: "5fcdf5f5581c833b189bb693",
//   courseId: "5fc8cfbb81a55b4c3c19737d",
// });
// const save = async () => {
//   enr.save();
// };
// save();

router.use('/courses', courseRouter);
router.use('/auth', authRouter);
router.use('/lessons', lessonRouter);
router.use('/classes', classRouter);

export default router;
