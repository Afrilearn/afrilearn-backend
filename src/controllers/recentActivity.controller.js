import RecentActivity from "../db/models/recentActivities.model";
import Lesson from "../db/models/lessons.model";

/**
 *Contains Lesson Controller
 *
 *
 *
 * @class RecentActivityController
 */
class RecentActivityController {
  /**
   * Add item to Recent Activity
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof RecentActivityController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addItemToRecentActivity(req, res) {
    try {
      // first increment lesson count
      const result = await Lesson.findOne({_id:req.body.lessonId});
      let viewCount = ++result.views;
      result.views = viewCount;
      result.save();
           
      // Store recent activities
      const latestRecentActivity = await RecentActivity.find({ userId: req.data.id })
        .sort({ createdAt: -1 })
        .limit(1); // latest docs
     
      let existingRecentActivity = false;

      if (
        latestRecentActivity.length > 0 &&
        latestRecentActivity[0].lessonId === req.body.lessonId
      ) {
        existingRecentActivity = true;
      }
    
      if (!existingRecentActivity) {
        const recentActivity = await RecentActivity.create({
          ...req.body,
          userId: req.data.id,
        });
        return res.status(200).json({
          status: "success",
          data: {
            recentActivity,
          },
        });
      }
      return res.status(200).json({
        status: "success",
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Saving RecentActivity",
      });
    }
  }

  /**
   * Get Recent Activities
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof RecentActivityController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getRecentActivities(req, res) {
    try {
      const recentActivities = await RecentActivity.find({
        userId: req.data.id,
      })
        .limit(5)
        .sort("-createdAt")
        .populate("quizResults");
      return res.status(200).json({
        status: "success",
        data: {
          recentActivities,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error loading RecentActivities",
      });
    }
  }
}
export default RecentActivityController;
