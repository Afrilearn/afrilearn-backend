import { Router } from 'express';
import ClassController from '../controllers/class.controller';
import validateToken from '../middlewares/auth.middleware';
// import authRouter from './auth.route';

const router = Router();

router.post('/add-class', validateToken, ClassController.addClass);
router.post(
  '/send-class-request',
  validateToken,
  ClassController.sendClassRequest,
); 

export default router;
