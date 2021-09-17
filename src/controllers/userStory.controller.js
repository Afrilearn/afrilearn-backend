import UserStory from "../db/models/userStory.model";

class UserStoryController {
  static async addUserStory(req, res) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.fileURL = req.file.location;
      }
      const customerStory = await UserStory.create(data);
      return res.status(201).json({
        status: "success",
        data: {
          customerStory
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding User Story",
      });
    }
  }

  static async getUserStory(req, res) {
    try {
      const customerStories = await UserStory.find({}).sort({ createdAt: -1 });
      return res.status(200).json({
        status: "success",
        data: {
          customerStories
        },
      });
    } catch (error) {    
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting UserStory",
      });
    }
  }
}
export default UserStoryController;

