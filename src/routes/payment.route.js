import { Router } from "express";
import PaymentController from "../controllers/payment.controller";

const router = Router();

router.get("/student-plans", PaymentController.getStudentPlans);
router.post("/verify-payment", PaymentController.verifyPayment);

export default router;
