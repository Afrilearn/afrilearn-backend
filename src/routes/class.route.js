import { Router } from 'express';
import ClassController from '../controllers/class.controller';
import validateToken from '../middlewares/auth.middleware';
import AcceptRejectClassRequest from '../validations/classes/acceptClassRequest.validator';
import AddAnnouncementValidator from '../validations/classes/addAnnouncement.validator';
import AddClassValidator from '../validations/classes/addClass.validator';
import AddCommentValidator from '../validations/classes/addComment.validator';
import AssignContent from '../validations/classes/assignContent.validator';
import SendClassRequest from '../validations/classes/sendClassRequest.validator';
// import authRouter from './auth.route';

const router = Router();

router.post(
  '/add-class',
  validateToken,
  AddClassValidator.validateData(),
  AddClassValidator.myValidationResult,
  ClassController.addClass,
);
router.post(
  '/send-class-request',
  validateToken,
  SendClassRequest.validateData(),
  SendClassRequest.myValidationResult,
  ClassController.sendClassRequest,
);
router.patch(
  '/accept-reject-class-request',
  AcceptRejectClassRequest.validateData(),
  AcceptRejectClassRequest.myValidationResult,
  validateToken,
  ClassController.acceptRejectRetractClassRequest,
);
router.get('/:classId/students', ClassController.getStudentsInClass);
router.post(
  '/:classId/announce',
  validateToken,
  AddAnnouncementValidator.validateData(),
  AddAnnouncementValidator.myValidationResult,
  ClassController.makeAnnouncement,
);
router.post(
  '/:announcementId/comment',
  validateToken,
  AddCommentValidator.validateData(),
  AddCommentValidator.myValidationResult,
  ClassController.makeComment,
);
router.get('/:classId/announcements', ClassController.getClassAnnouncements);
router.get('/:classId', ClassController.getClassById);
router.post(
  '/:classId/assign-content',
  validateToken,
  AssignContent.validateData(),
  AssignContent.myValidationResult,
  ClassController.assignContent,
);

export default router;
