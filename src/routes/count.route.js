import { Router } from 'express';
import CountController from '../controllers/count.countroller';
// import authRouter from './auth.route';

const router = Router();

router.get('/get-all-counts', CountController.getAllCounts);
export default router;
