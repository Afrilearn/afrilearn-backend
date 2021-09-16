import { Router } from "express";
import UserStoryController from "../controllers/userStory.controller";
import upload from "../config/bucket";

const router = Router();

router.post("/", upload.single("image"), UserStoryController.addUserStory);
router.get("/stories", UserStoryController.getUserStory);
export default router;
