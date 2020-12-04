import { Router } from "express";
import CourseController from "../controllers/course.controller";
// import authRouter from './auth.route';

const router = Router();

router.get("/", CourseController.loadCourses);

export default router;
