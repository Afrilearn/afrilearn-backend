import { Router } from "express";
import CommentController from "../controllers/comment.controller";
import CommentValidator from "../validations/comments/comment.validator";
import validateToken from "../middlewares/auth.middleware";

const router = Router();


router.post(
  "/",
  validateToken,
  CommentValidator.validateAddComment(),
  CommentValidator.myValidationResult,
  CommentController.addLessonComment
);

router.post(
  "/like-comment",
  validateToken,
  CommentValidator.validateLikeComment(),
  CommentValidator.myValidationResult,
  CommentController.likeLessonComment
);

router.delete(
  "/unlike-comment",
  validateToken,
  CommentValidator.validateLikeComment(),
  CommentValidator.myValidationResult,
  CommentController.unLikeLessonComment
);

router.post(
  "/:lessonId",
  validateToken,
  CommentValidator.validateGetLessonComments(),
  CommentValidator.myValidationResult,
  CommentController.getLessonComments
);

router.post(
  "/reply/add",
  validateToken,
  CommentValidator.validateAddCommentReply(),
  CommentValidator.myValidationResult,
  CommentController.addLessonCommentReply
);

router.delete(
  "/:lessonCommentId",
  validateToken,
  CommentController.deleteLessonComment
);

router.patch(
  "/:lessonCommentId",
  validateToken,
  CommentValidator.validateCommentUpdate(),
  CommentValidator.myValidationResult,
  CommentController.updateLessonComment
);

export default router;
