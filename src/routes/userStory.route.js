import { Router } from "express";
import UserStoryController from "../controllers/UserStory.controller";
import upload from "../config/bucket";

const router = Router();

router.post("/", upload.single("image"), UserStoryController.addUserStory);
router.get("/", UserStoryController.getUserStory);
// please work
export default router;
