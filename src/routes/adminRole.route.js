import { Router } from "express";
import AdminRoleController from "../controllers/adminRole.controller";

const router = Router();

router.post("/add-admin-to-class", AdminRoleController.addAdminToClass);

export default router;
