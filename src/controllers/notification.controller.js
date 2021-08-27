import Notification from "../db/models/notification.model";

class NotificationController {
  static async createNotification(req, res) {
    try {
      const notification = await Notification.create({ ...req.body });

      return res.status(200).json({
        status: "success",
        data: {
          notification,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Creating notification",
      });
    }
  }
  static async readNotification(req, res) {
    try {
      const notifications = await Notification.find({
        userId: req.params.userId,
      });

      return res.status(200).json({
        status: "success",
        data: {
          notifications,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Getting notification",
      });
    }
  }
  static async updateNotification(req, res) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["title", "message", "seen"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      return res.status(400).json({
        status: "400 Invalid Updates",
        error: "Error updating notification",
      });
    }
    try {
      const notification = await Notification.findById(
        req.params.notificationId
      );
      if (!notification) {
        return res.status(404).json({
          status: "404 Not Found",
          error: "Notification not found",
        });
      }
      updates.forEach((update) => {
        notification[update] = req.body[update];
      });
      await notification.save();

      return res.status(200).json({
        status: "success",
        data: {
          notification,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Updating notification",
      });
    }
  }
  static async deleteNotification(req, res) {
    try {
      const notification = await Notification.findByIdAndDelete(
        req.params.notificationId
      );
      return res.status(200).json({
        status: "success",
        data: {
          notification,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Deleting notification",
      });
    }
  }
}
export default NotificationController;
