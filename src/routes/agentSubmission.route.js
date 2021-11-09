import { Router } from "express";
import upload from "../config/bucket";
import AgentSubmissionController from "../controllers/agentSubmission.controller";

const router = Router();

router.post("/", upload.single("file"), AgentSubmissionController.submitEntry);

export default router;
