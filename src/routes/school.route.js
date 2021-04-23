import { Router } from "express";
import SchoolController from "../controllers/school.controller";


const router = Router();

router.get("/:schoolId", SchoolController.getSchoolProfile);

export default router;
