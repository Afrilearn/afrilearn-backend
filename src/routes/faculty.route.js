import { Router } from "express";
import FacultyController from "../controllers/faculty.controller";
import upload from "../config/bucket";

const router = Router();

router.patch(
  "/:facultyId",
  upload.single("image"),
  FacultyController.updateFaculty
);
router.post("/", upload.single("image"), FacultyController.addFaculty);
router.get("/", FacultyController.getFaculty);

export default router;
