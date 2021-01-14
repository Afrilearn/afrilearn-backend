import { Router } from 'express';
import PaymentController from '../controllers/payment.controller';

const router = Router();

router.get('/plans', PaymentController.getPaymentPlans);
router.post('/verify-payment', PaymentController.verifyPayment);

export default router;
