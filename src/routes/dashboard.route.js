import {
  Router
} from "express";
import DashboardController from "../controllers/dashboard.controller";
import validateToken from "../middlewares/auth.middleware";

const router = Router();

router.post("/", validateToken, DashboardController.getUserDashboard);
router.post(
  "/web",
  validateToken,
  DashboardController.getUserDashboardWebVersion
);
router.post(
  "/class-membership",
  validateToken,
  DashboardController.getUserDashboardClassMembership
);
router.post(
  "/recentActivities-by-time",
  DashboardController.getUserDashboardRecentActivitiesTimeBased
);
router.post(
  "/recentActivities",
  validateToken,
  DashboardController.getUserDashboardRecentActivities
);
router.post(
  "/recommendations",
  validateToken,
  DashboardController.getUserDashboardRecommendations
);
router.post(
  "/enrolled-courses",
  validateToken,
  DashboardController.getUserDashboardEnrolledCourses
);
router.post(
  "/student-performance-summary",
  validateToken,
  DashboardController.getStudentPerformanceSummary
);
router.get('/unfinishedVideos', validateToken, DashboardController.getUserUnFinishedVideos);
router.post('/topTen', validateToken, DashboardController.getCourseTopTen);
router.post('/favourite', validateToken, DashboardController.getUserFavouriteVideos);
router.get('/topTen', DashboardController.getAfrilearnTopTen);

export default router;