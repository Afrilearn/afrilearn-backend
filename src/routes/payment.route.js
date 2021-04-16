import { Router } from 'express';
import PaymentController from '../controllers/payment.controller';
import validateToken from '../middlewares/auth.middleware';
import AddTransaction from '../validations/payment/addTransaction.validator';
import VerifyPayment from '../validations/payment/verifyGooglePayment.validator';

const router = Router();

router.get('/plans', PaymentController.getPaymentPlans);
router.post(
  '/add-transaction',
  validateToken, 
  AddTransaction.validateData(),
  AddTransaction.myValidationResult,
  PaymentController.addTransaction,
);
router.post('/verify-payment', PaymentController.verifyPayment);
router.post(
  '/verify-paystack-payment',
  PaymentController.verifyPaystackPayment,
);
router.post(
  '/verify-google-payment',
  validateToken, 
  VerifyPayment.validateData(),
  VerifyPayment.myValidationResult,
  PaymentController.verifyGoogleBilingPayment,
);
export default router;
