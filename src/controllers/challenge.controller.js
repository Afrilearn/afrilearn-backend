import Challenge from "../db/models/challenge.model";
import ChallengeResult from "../db/models/challengeResult.model";
import Participant from "../db/models/participant.model";

/**
 *Contains Challenge Controller
 *
 *
 *
 * @class ChallengeController
 */
class ChallengeController {
  /**
   * Add a Challenge
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ChallengeController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addChallenge(req, res) {
    try {
      const result = await Challenge.create({
        ...req.body,
        userId: req.data.id,
      });
      const challenge = await Challenge.findOne({
        _id: result._id,
      }).populate({
        path: "examCategoryId classId schoolId userId",
        select: "name fullName profilePhotoUrl",
      });
      return res.status(200).json({
        status: "success",
        data: {
          challenge,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding challenge",
      });
    }
  }

  /**
   * Get Challenges
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ChallengeController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getChallenges(req, res) {
    try {
      const options = {};
      if (req.query.examCategoryId) {
        options.examCategoryId = req.query.examCategoryId;
      }
      if (req.query.courseId) {
        options.courseId = req.query.courseId;
      }
      if (req.query.classId) {
        options.classId = req.query.classId;
      }
      if (req.query.schoolId) {
        options.schoolId = req.query.schoolId;
      }
      console.log("options", options);

      const challenges = await Challenge.find({ ...options }).populate({
        path: "examCategoryId classId schoolId userId",
        select: "name fullName profilePhotoUrl",
      });
      if (!challenges) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Challenge not found",
        });
      }
      return res.status(200).json({
        status: "success",
        data: {
          challenges,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Getting challenges",
      });
    }
  }

  /**
   * Get a Challenge
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ChallengeController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getChallenge(req, res) {
    try {
      const challenge = await Challenge.findOne({
        _id: req.params.challengeId,
      }).populate({
        path: "examCategoryId classId schoolId userId",
        select: "name fullName profilePhotoUrl",
      });
      if (!challenge) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Challenge not found",
        });
      }
      return res.status(200).json({
        status: "success",
        data: {
          challenge,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Getting challenge",
      });
    }
  }

  /**
   * Delete a Challenge
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ChallengeController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async deleteChallenge(req, res) {
    try {
      const challenge = await Challenge.findByIdAndDelete(
        req.params.challengeId
      );
      if (!challenge) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Challenge not found",
        });
      }
      return res.status(200).json({
        status: "success",
        data: {
          challenge,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Deleting challenge",
      });
    }
  }

  /**
   * Register for a Challenge
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ChallengeController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async registerForAChallenge(req, res) {
    try {
      //conditions
      //if there is classId, user must be in that class else rejected
      //if there is schoolId, user must be in that school else rejected
      //if there is courselId, user must be enrolled in that coursel else rejected
      await Participant.create({
        challengeId: req.params.challengeId,
        userId: req.data.id,
      });
      const participants = await Participant.find({
        challengeId: req.params.challengeId,
      }).populate({
        path: "userId",
        select: "fullName profilePhotoUrl",
      });
      const challenge = await Challenge.findOne({
        _id: req.params.challengeId,
      }).populate({
        path: "examCategoryId classId schoolId userId courseId",
        select: "name fullName profilePhotoUrl categoryId",
      });

      return res.status(200).json({
        status: "success",
        data: {
          challenge,
          participants,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Registering for challenge",
      });
    }
  }

  /**
   * store a Challenge result
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ChallengeController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async storeAChallengeResult(req, res) {
    try {
      await ChallengeResult.create({
        ...req.body,
        userId: req.data.id,
        challengeId: req.params.challengeId,
      });
      const results = await ChallengeResult.find({
        challengeId: req.params.challengeId,
      }).populate({
        path: "userId",
        select: "fullName profilePhotoUrl",
      });
      return res.status(200).json({
        status: "success",
        data: {
          results,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error storing results",
      });
    }
  }

  /**
   * get Challenge results
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ChallengeController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getChallengeResults(req, res) {
    try {
      const results = await ChallengeResult.find({
        challengeId: req.params.challengeId,
      }).populate({
        path: "userId",
        select: "fullName profilePhotoUrl",
      });
      return res.status(200).json({
        status: "success",
        data: {
          results,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting results",
      });
    }
  }
}
export default ChallengeController;
