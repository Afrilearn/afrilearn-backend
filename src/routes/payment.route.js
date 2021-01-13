import { Router } from "express";
import PaymentController from "../controllers/payment.controller";

const router = Router();

router.post("/verify-payment", PaymentController.verifyPayment);

export default router;
