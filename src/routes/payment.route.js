import { Router } from 'express';
import PaymentController from '../controllers/payment.controller';

const router = Router();

router.get('/verify-payment', PaymentController.verifyPayment);

export default router;
