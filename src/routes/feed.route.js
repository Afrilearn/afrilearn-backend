import { Router } from "express";
import feedUpload from "../config/feedBucket";
import FeedController from "../controllers/feed.controller";
import verifyToken from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/posts",
  verifyToken,
  feedUpload.single("image"),
  FeedController.sendAPost
);
router.patch(
  "/posts/:postId",
  verifyToken,
  feedUpload.single("image"),
  FeedController.editAPost
);
router.delete("/posts/:postId", verifyToken, FeedController.deleteAPost);
router.post(
  "/comment/:postId",
  feedUpload.single("image"),
  verifyToken,
  FeedController.commentToAPost
);
router.post("/add-like/:postId", verifyToken, FeedController.saveLikedPost);
router.post(
  "/remove-like/:postId",
  verifyToken,
  FeedController.removeLikedPost
);
router.post(
  "/add-comment-like/:commentId",
  verifyToken,
  FeedController.saveLikedComment
);
router.post(
  "/remove-comment-like/:commentId",
  verifyToken,
  FeedController.removeLikedComment
);
router.post("/users/:searchQuery", FeedController.searchForUsers);
router.get("/users", FeedController.getUsersForMyFeed);
router.post("/search/:searchQuery", FeedController.searchForPost);
router.patch("/follow/:userId", verifyToken, FeedController.followAUser);
router.get("/posts", verifyToken, FeedController.getMyFeed);
router.get("/followings", verifyToken, FeedController.getMyFollowings);
router.get("/followers", verifyToken, FeedController.getMyFollowers);
router.get("/profile/:userId", verifyToken, FeedController.getAUserProfile);
router.get(
  "/courses-subjects",
  FeedController.getCourseAndRelatedSubjectsForFeed
);

export default router;
