import { Router } from 'express';
import PaymentController from '../controllers/payment.controller';
import validateToken from '../middlewares/auth.middleware';
import AddTransaction from '../validations/payment/addTransaction.validator';

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

export default router;
