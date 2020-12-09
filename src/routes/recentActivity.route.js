import { Router } from 'express';
import RecentActivityController from '../controllers/recentActivity.controller';
// import authRouter from './auth.route';

const router = Router();

router.post(
  '/add-recent-activity',
  RecentActivityController.addItemToRecentActivity,
);
export default router;
