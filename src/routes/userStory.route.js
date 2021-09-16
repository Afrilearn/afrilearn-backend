import { Router } from "express";
import UserStoryController from "../controllers/userStory.controller";
import upload from "../config/bucket";

const router = Router();
router.get("/stories", UserStoryController.getUserStory);
router.post("/", upload.single("image"), UserStoryController.addUserStory);

export default router;
