import Challenge from "../db/models/challenge.model";
import ChallengeResult from "../db/models/challengeResult.model";
import Participant from "../db/models/participant.model";
import User from "../db/models/users.model";
import EnrolledCourse from "../db/models/enrolledCourses.model";
import ChallengeType from "../db/models/challengeTypes.model";

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
      const challenge = await Challenge.create({
        ...req.body,
        creatorId: req.data.id,
      });
      return res.status(200).json({
        status: "success",
        data: {
          challenge,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding challenge",
      });
    }
  }

  /**
   * Add a Challenge Type
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ChallengeController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addChallengeType(req, res) {
    try {
      const challengeType = await ChallengeType.create({
        name: req.body.name,
      });
      return res.status(200).json({
        status: "success",
        data: {
          challengeType,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding challenge Type",
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
   static async getChallengeForACourse(req, res) {
    try {      
      const options = {
        challengeTypeId:'611a6e1343ceb054480c5538'
      };      
      if (req.query.courseId) {
        options.courseId = req.query.courseId;
      }
      if (req.query.classId) {
        options.classId = req.query.classId;
      }
      if (req.query.schoolId) {
        options.schoolId = req.query.schoolId;
      }   

      const challenges = await Challenge.find({ ...options }).limit(10).sort({
        createdAt: -1
      })
      const options1 = {
        description:'Battle-with-friends',
        challengeTypeId:'611a6f14af35ab4d3415c012'
      }
      const challengeAFriendGeneralInfor = await Challenge.find(options1)

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
          challengeAFriendGeneralInfor
        },
      });
    } catch (error) {
      // //console.log("error", error);
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
      // //console.log("error", error);
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
      //console.log("error", error);
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
      //console.log("error", error);
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
      await ChallengeResult.findOneAndDelete({
        challengeId: req.body.challengeId,
        userId: req.body.userId,
      });
      const challengeResult = await ChallengeResult.create(req.body);
      return res.status(200).json({
        status: "success",
        data: {
          challengeResult,
        },
      });
    } catch (error) {
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
      })
        .sort({
          winRatio: -1,
        })
        .populate({
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
      //console.log("error", error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting results",
      });
    }
  }

  /**
   * get friends for challenge
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ChallengeController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getFriendsForChallenge(req, res) {
    try {
      const enrollments = await EnrolledCourse.find({
        courseId: req.params.courseId,
      })
        .populate({ path: "userId", select: "fullName profilePhotoUrl" })
        .limit(20)
        .select("userId");

      const users = [];
      // for (let index = 0; index < enrollments.length; index++) {
      //   const enrollment = enrollments[index];

      //   const notExists = users.indexOf(enrollment) === -1;
      //   if (enrollment.userId && notExists) {
      //     users.push(enrollment.userId);
      //   }
      // }

      return res.status(200).json({
        status: "success",
        data: {
          users: enrollments,
        },
      });
    } catch (error) {
      //console.log("error", error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting users",
      });
    }
  }

  /**
   * Search for users
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof ChallengeController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async searchForUsers(req, res) {
    try {
      const searchData = new RegExp(req.query.searchQuery, "i");
      const users = await User.find({
        $or: [{ fullName: searchData }],
      })
        .sort({ fullName: 1 })
        .select("fullName profilePhotoUrl")
        .limit(20);

      return res.status(200).json({
        status: "success",
        data: { users },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Searching",
      });
    }
  }
}
export default ChallengeController;
