import { Router } from "express";
import PaymentController from "../controllers/payment.controller";
import AuthController from "../controllers/auth.controller";
import validateToken from "../middlewares/auth.middleware";
import PaymentValidator from "../validations/payment/payments.validator";

const router = Router();

router.post(
  "/credit-user",
  // validateToken,
  PaymentValidator.validateZenithPaymentData(),
  PaymentValidator.myValidationResult,
  PaymentController.creditZenithUsers
);

router.get(
  "/get-courses" ,
  // validateToken, 
  AuthController.zenithPaymentData
);
router.get("/payment-plans", PaymentController.getPaymentPlans);
export default router;
