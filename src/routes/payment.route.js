import { Router } from "express";
import PaymentController from "../controllers/payment.controller";
import validateToken from "../middlewares/auth.middleware";
import AddTransaction from "../validations/payment/addTransaction.validator";
import VerifyPayment from "../validations/payment/verifyGooglePayment.validator";

const router = Router();

router.get("/plans", PaymentController.getPaymentPlans);
router.get("/coin-plans", PaymentController.getAfriCoinPaymentPlans);
router.post("/add-coin-plan", PaymentController.addAfriCoinPaymentPlan);
router.post(
  "/add-transaction",
  validateToken,
  AddTransaction.validateData(),
  AddTransaction.myValidationResult,
  PaymentController.addTransaction
);

router.post(
  "/verify-paystack-payment",
  validateToken,
  PaymentController.verifyPaystackPayment
);
router.post(
  "/pay-with-coins",
  validateToken,
  PaymentController.payWithAfriCoins
);

router.post(
  "/verify-google-payment",
  validateToken,
  VerifyPayment.validateData(),
  VerifyPayment.myValidationResult,
  PaymentController.verifyGoogleBilingPayment
);
router.post(
  "/verify-google-payment-for-coin-purchase",
  validateToken,
  VerifyPayment.validateData(),
  VerifyPayment.myValidationResult,
  PaymentController.verifyGoogleBilingPaymentForCoinPurchase
);
export default router;
