import { Router } from "express";
import verifyToken from "../middlewares/auth.middleware";

import StudentRequestController from "../controllers/studentRequest.controller";
import upload from "../config/bucket";

const router = Router();

router.post(
  "/add-request",
  verifyToken,
  upload.single("file"),
  StudentRequestController.addStudentRequest
);

router.get("/", verifyToken, StudentRequestController.getMyRequests);

export default router;
