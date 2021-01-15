// import RecentActivity from '../db/models/recentActivities.model';
// /**
//  *Contains Lesson Controller
//  *
//  *
//  *
//  * @class RecentActivityController
//  */
// class RecentActivityController {
//   /**
//    * Add item to Recent Activity
//    * @param {Request} req - Response object.
//    * @param {Response} res - The payload.
//    * @memberof RecentActivityController
//    * @returns {JSON} - A JSON success response.
//    *
//    */
//   static async addItemToRecentActivity(req, res) {
//     try {
//       const bodyContainsExpectedIds = Object.keys(req.body).includes('questionId')
//         || Object.keys(req.body).includes('lessonId')
//         || Object.keys(req.body).includes('classId');
//       if (!bodyContainsExpectedIds) {
//         return res.status(400).json({
//           status: '400 bad request',
//           error: 'ID not sent',
//         });
//       }

//       const recentActivity = await RecentActivity.create({
//         ...req.body,
//         userId: req.data.id,
//       });
//       return res.status(200).json({
//         status: 'success',
//         data: {
//           recentActivity,
//         },
//       });
//     } catch (error) {
//       return res.status(500).json({
//         status: '500 Internal server error',
//         error: 'Error Saving RecentActivity',
//       });
//     }
//   }

//   /**
//    * Get Recent Activities
//    * @param {Request} req - Response object.
//    * @param {Response} res - The payload.
//    * @memberof RecentActivityController
//    * @returns {JSON} - A JSON success response.
//    *
//    */
//   static async getRecentActivities(req, res) {
//     try {
//       const recentActivities = await RecentActivity.find({
//         userId: req.data.id,
//       })
//         .limit(5)
//         .sort('-createdAt');
//       return res.status(200).json({
//         status: 'success',
//         data: {
//           recentActivities,
//         },
//       });
//     } catch (error) {
//       return res.status(500).json({
//         status: '500 Internal server error',
//         error: 'Error loading RecentActivities',
//       });
//     }
//   }
// }
// export default RecentActivityController;
