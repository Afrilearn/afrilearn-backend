import Course from "../db/models/courses.model";
import Follow from "../db/models/follow.model";
import Lesson from "../db/models/lessons.model";
import PostComment from "../db/models/postComment.model";
import Post from "../db/models/posts.model";
import Subject from "../db/models/subjects.model";
import User from "../db/models/users.model";

/**
 *Contains AdminRole Controller
 *
 *
 *
 * @class FeedController
 */
class FeedController {
  /**
   * Get a user's profile
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof FeedController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getAUserProfile(req, res) {
    try {
      const profile = await User.findOne({
        _id: req.params.userId,
      })
        .select(
          "fullName email state country role followings followers enrolledCourses"
        )
        .populate({
          path: "role",
        })
        .populate({
          path: "enrolledCourses",
          select: "courseId",
          populate: {
            path: "courseId",
            select: "name",
          },
        });

      if (!profile) {
        return res.status(404).json({
          status: "404 Not found",
          error: "Profile not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          profile,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Getting Profile",
      });
    }
  }

  /**
   * Get my Feed
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof FeedController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getMyFeed(req, res) {
    try {
      const posts = await Post.find({})
        .sort({ createdAt: -1 })
        .populate({
          path: "comments",
          model: PostComment,
          sort: { createdAt: -1 },
          populate: {
            path: "userId",
            model: User,
            select: "fullName profilePhotoUrl",
          },
        })
        .populate({
          path: "userId",
          model: User,
          select: "fullName profilePhotoUrl",
        });

      return res.status(200).json({
        status: "success",
        data: {
          posts,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Getting Posts",
      });
    }
  }

  /**
   * Send a Post
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof FeedController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async sendAPost(req, res) {
    try {
      const data = {
        userId: req.data.id,
      };
      if (req.file) {
        data.imageUrl = req.file.location;
      }
      if (req.body.text) {
        data.text = req.body.text;
      }
      if (req.body.visibility) {
        data.visibility = req.body.visibility;
      }
      if (req.body.courseId) {
        data.courseId = req.body.courseId;
        const course = await Course.findOne({ _id: req.body.courseId });
        data.courseName = course.name;
      }
      if (req.body.subjectId) {
        data.subjectId = req.body.subjectId;
        const subject = await Subject.findOne({
          _id: req.body.subjectId,
        }).populate({ path: "mainSubjectId" });
        data.subjectName =
          subject && subject.mainSubjectId && subject.mainSubjectId.name;
      }
      if (req.body.lessonId) {
        data.lessonId = req.body.lessonId;
        const lesson = await Lesson.findOne({ _id: req.body.lessonId });
        data.lessonName = lesson.title;
      }
      if (!req.body.text) {
        return res.status(400).json({
          status: "400 Bad request",
          error: "Try sending a text",
        });
      }
      const result = await Post.create(data);
      const post = await Post.findOne({ _id: result._id }).populate({
        path: "userId",
        model: User,
        select: "fullName profilePhotoUrl",
      });

      return res.status(200).json({
        status: "success",
        data: {
          post,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Sending Post",
      });
    }
  }

  /**
   * Edit a Post
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof FeedController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async editAPost(req, res) {
    try {
      const post = await Post.findOne({ _id: req.params.postId }).populate({
        path: "userId",
        model: User,
        select: "fullName profilePhotoUrl",
      });
      if (!post) {
        return res.status(404).json({
          status: "404 Internal server error",
          error: "Post not found",
        });
      }
      if (req.file) {
        post.imageUrl = req.file.location;
      }
      if (req.body.text) {
        post.text = req.body.text;
      }
      if (req.body.visibility) {
        post.visibility = req.body.visibility;
      }
      if (req.body.courseId) {
        post.courseId = req.body.courseId;
        const course = await Course.findOne({ _id: req.body.courseId });
        post.courseName = course.name;
      }
      if (req.body.subjectId) {
        post.subjectId = req.body.subjectId;
        const subject = await Subject.findOne({
          _id: req.body.subjectId,
        }).populate({ path: "mainSubjectId" });
        post.subjectName =
          subject && subject.mainSubjectId && subject.mainSubjectId.name;
      }
      if (req.body.lessonId) {
        post.lessonId = req.body.lessonId;
        const lesson = await Lesson.findOne({ _id: req.body.lessonId });
        post.lessonName = lesson.title;
      }
      await post.save();

      return res.status(200).json({
        status: "success",
        data: {
          post,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Updating Post",
      });
    }
  }

  /**
   * Delete a Post
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof FeedController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async deleteAPost(req, res) {
    try {
      const post = await Post.findOneAndDelete({
        _id: req.params.postId,
      });

      if (!post) {
        return res.status(404).json({
          status: "404 Internal server error",
          error: "Post not found",
        });
      }
      if (req.data.id !== post.userId) {
        return res.status(401).json({
          status: "401 Internal server error",
          error: "You are not Authorized",
        });
      }
      return res.status(200).json({
        status: "success",
        data: {
          post,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Deleting Post",
      });
    }
  }

  /**
   * Save liked  Post
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async saveLikedPost(req, res) {
    try {
      let selectedPost = await Post.findById(req.params.postId);
      if (!selectedPost) {
        return res.status(404).json({
          status: "404 Internal server error",
          error: "Post not found",
        });
      }
      selectedPost.likes = selectedPost.likes.slice(); // Clone the tags array
      selectedPost.likes.push(req.data.id);
      selectedPost.save();

      return res.status(200).json({
        status: "success",
        data: {
          selectedPost,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error saving like",
      });
    }
  }

  /**
   * Remove liked Post
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof LessonController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async removeLikedPost(req, res) {
    try {
      let selectedPost = await Post.findById(req.params.postId);
      if (!selectedPost) {
        return res.status(404).json({
          status: "404 Internal server error",
          error: "Post not found",
        });
      }
      selectedPost.likes = selectedPost.likes.slice(); // Clone the tags array
      selectedPost.likes.pull(req.data.id);
      selectedPost.save();

      return res.status(200).json({
        status: "success",
        data: { selectedPost },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error removing like",
      });
    }
  }

  /**
   * Comment to a post
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof FeedController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async commentToAPost(req, res) {
    try {
      const data = {
        userId: req.data.id,
        postId: req.params.postId,
        text: req.body.text,
      };
      if (req.file) {
        data.imageUrl = req.file.location;
      }
      const result = await PostComment.create(data);
      const comment = await PostComment.findOne({ _id: result._id }).populate({
        path: "userId",
        select: "fullName profilePhotoUrl",
      });

      return res.status(200).json({
        status: "success",
        data: {
          comment,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding Comment",
      });
    }
  }

  /**
   * Get myfollowings
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof FeedController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getMyFollowings(req, res) {
    try {
      const followings = await Follow.find({
        followerId: req.data.id,
      }).populate({
        path: "userId",
        select: "fullName profilePhotoUrl role",
        populate: "role",
      });

      return res.status(200).json({
        status: "success",
        data: {
          followings,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Getting Followings",
      });
    }
  }

  /**
   * Get myfollowers
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof FeedController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async getMyFollowers(req, res) {
    try {
      const followers = await Follow.find({
        userId: req.data.id,
      }).populate({
        path: "followerId",
        select: "fullName profilePhotoUrl role",
        populate: "role",
      });

      return res.status(200).json({
        status: "success",
        data: {
          followers,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Getting Followers",
      });
    }
  }

  /**
   * Follow a user
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof FeedController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async followAUser(req, res) {
    try {
      const followed = await Follow.findOne({
        followerId: req.data.id,
        userId: req.params.userId,
      });
      let userFollowing = await User.findOne({ _id: req.data.id });
      let userBeingFollowed = await User.findOne({ _id: req.params.userId });
      userFollowing.followings = userFollowing.followings.slice(); // Clone the tags array
      userBeingFollowed.followers = userBeingFollowed.followers.slice(); // Clone the tags array
      if (followed) {
        await followed.remove();
        userFollowing.followings.pull(req.params.userId);
        userBeingFollowed.followers.pull(req.data.id);
      } else {
        await Follow.create({
          followerId: req.data.id,
          userId: req.params.userId,
        });
        userFollowing.followings.push(req.params.userId);
        userBeingFollowed.followers.push(req.data.id);
      }
      userFollowing.save();
      userBeingFollowed.save();

      const followings = await Follow.countDocuments({
        followerId: req.data.id,
      });
      const followers = await Follow.countDocuments({
        userId: req.data.id,
      });

      return res.status(200).json({
        status: "success",
        data: {
          followings,
          followers,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Following User",
      });
    }
  }

  /**
   * Search for Post
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof FeedController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async searchForPost(req, res) {
    try {
      const searchData = new RegExp(req.params.searchQuery, "i");
      const posts = await Post.find({
        $or: [
          { text: searchData },
          { lessonName: searchData },
          { subjectName: searchData },
          { courseName: searchData },
        ],
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        status: "success",
        data: { posts },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Searching",
      });
    }
  }

  /**
   * Search for users
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof FeedController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async searchForUsers(req, res) {
    try {
      const searchData = new RegExp(req.params.searchQuery, "i");
      const users = await User.find({
        $or: [{ fullName: searchData }],
      })
        .sort({ fullName: 1 })
        .select("fullName")
        .populate({
          path: "role",
        });

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
export default FeedController;
