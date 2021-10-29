import { Router } from "express";
import AdminRoleController from "../controllers/adminRole.controller";

const router = Router();

router.post("/add-admin-to-class", AdminRoleController.addAdminToClass);
router.post(
  "/add-existing-as-admin-to-class",
  AdminRoleController.addTeacherAsAdminToClass
);

export default router;
