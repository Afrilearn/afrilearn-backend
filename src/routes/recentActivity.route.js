import { Router } from 'express';
import RecentActivityController from '../controllers/recentActivity.controller';
import validateToken from '../middlewares/auth.middleware';
// import authRouter from './auth.route';

const router = Router();

router.post(
  '/add-recent-activity',
  validateToken,
  RecentActivityController.addItemToRecentActivity,
);
router.get(
  '/activities',
  validateToken,
  RecentActivityController.getRecentActivities,
);
export default router;
