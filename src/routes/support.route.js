import { Router } from 'express';
import SupportRequestController from '../controllers/support.controller';
// import authRouter from './auth.route';

const router = Router();

router.post(
  '/add-support',
  SupportRequestController.addSupportRequest,
);
export default router;
