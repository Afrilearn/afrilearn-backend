import { Router } from "express";
import NotificationController from "../controllers/notification.controller";

const router = Router();

router.post("/", NotificationController.createNotification);
router.get("/:userId", NotificationController.readNotification);
router.patch("/:notificationId", NotificationController.updateNotification);
router.delete("/:notificationId", NotificationController.deleteNotification);

export default router;
