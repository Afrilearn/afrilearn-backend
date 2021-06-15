import { Router } from "express";
import SchoolController from "../controllers/school.controller";
import verifyToken from "../middlewares/auth.middleware";
import upload from "../config/bucket";
import SignupForStudent from "../validations/auth/signupForStudent.validator";
import SignupForTeacher from "../validations/auth/signupForTeacher.validator";
import UnlinkStudentAccount from "../validations/auth/unlinkStudentAccount.validator";
import AddUserAsTeacher from "../validations/auth/addUserAsTeacher.validator";
import MaketeacherAnAdmin from "../validations/auth/makeTeacherAdmin.validator";
import SignupForAdmin from "../validations/auth/signupForAdmin.validator";

const router = Router();

router.get("/:schoolId", SchoolController.getSchoolProfile);
router.get("/:schoolId/courses", SchoolController.getSchoolCourses);

router.post(
  "/sign-up-for-student",
  SignupForStudent.validateData(),
  SignupForStudent.myValidationResult,
  SchoolController.signUpForStudent
);
router.post(
  "/sign-up-for-teacher",
  SignupForTeacher.validateData(),
  SignupForTeacher.myValidationResult,
  SchoolController.signUpForTeacher
);
router.post(
  "/sign-up-for-admin",
  SignupForAdmin.validateData(),
  SignupForAdmin.myValidationResult,
  SchoolController.signUpForSchoolAdmin
);
router.post(
  "/add-user-as-teacher",
  AddUserAsTeacher.validateData(),
  AddUserAsTeacher.myValidationResult,
  SchoolController.schoolAddExistingTeacher
);
router.post(
  "/accept-teacher-request",
  AddUserAsTeacher.validateData(),
  AddUserAsTeacher.myValidationResult,
  SchoolController.acceptTeacherRequest
);
router.post(
  "/add-teacher-as-admin",
  MaketeacherAnAdmin.validateData(),
  MaketeacherAnAdmin.myValidationResult,
  SchoolController.makeTeacherAdmin
);
router.post(
  "/accept-admin-request",
  MaketeacherAnAdmin.validateData(),
  MaketeacherAnAdmin.myValidationResult,
  SchoolController.acceptAdminRequest
);

router.patch(
  "/unlink-teacher-account",
  UnlinkStudentAccount.validateData(),
  UnlinkStudentAccount.myValidationResult,
  SchoolController.unlinkTeacherAccount
);
router.delete(
  "/delete-teacher-account",
  UnlinkStudentAccount.validateData(),
  UnlinkStudentAccount.myValidationResult,
  SchoolController.deleteTeacherAccount
);
router.patch(
  "/unlink-student-account",
  UnlinkStudentAccount.validateData(),
  UnlinkStudentAccount.myValidationResult,
  SchoolController.unlinkStudentAccount
);
router.delete(
  "/delete-student-account",
  UnlinkStudentAccount.validateData(),
  UnlinkStudentAccount.myValidationResult,
  SchoolController.deleteStudentAccount
);

router.patch(
  "/update-logo/:schoolId",
  upload.single("logo"),
  verifyToken,
  SchoolController.uploadSchoolLogo
);
router.patch(
  "/update-cover-photo/:schoolId",
  upload.single("coverPhoto"),
  verifyToken,
  SchoolController.uploadSchoolCoverPhoto
);
router.patch(
  "/update-profile/:schoolId",
  verifyToken,
  SchoolController.updateSchoolProfile
);

export default router;
