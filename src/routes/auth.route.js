import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import SocialLoginController from "../controllers/socialLogin.controller";
import SignUpValidator from "../validations/auth/signup.validator";
import verifyToken from "../middlewares/auth.middleware";
import LoginValidator from "../validations/auth/login.validator";
import PasswordResetValidator from "../validations/auth/resetPassword.validator";
import SocialLoginValidator from "../validations/auth/socialLogin.validator";
import CheckUserAndJoin from "../validations/auth/checkAndJoin.validator";
import upload from "../config/bucket";
import AddCourseForChild from "../validations/auth/addCourseForChild";
import SignupForChild from "../validations/auth/signupForChild.validator";
import AddUserAsChild from "../validations/auth/addUserAsChild.validator";
import UnlinkChildAccount from "../validations/auth/unlinkChildAccount.validator";
import SignupForStudent from "../validations/auth/signupForStudent.validator";
import SignupForTeacher from "../validations/auth/signupForTeacher.validator";
import UnlinkStudentAccount from "../validations/auth/unlinkStudentAccount.validator";
import AddUserAsTeacher from "../validations/auth/addUserAsTeacher.validator";
import MaketeacherAnAdmin from "../validations/auth/makeTeacherAdmin.validator";
import UnlinkChildrenAccounts from "../validations/auth/unlinkChildrenAccounts.validator";

const router = Router();

router.post(
  "/signup",
  SignUpValidator.validateData(),
  SignUpValidator.myValidationResult,
  SignUpValidator.emailAlreadyExist,
  AuthController.signUp
);

router.get("/activate_account", verifyToken, AuthController.activateAccount);

router.post(
  "/login",
  LoginValidator.validateData(),
  LoginValidator.myValidationResult,
  AuthController.login
);

router.get(
  "/:email/reset_password",
  PasswordResetValidator.emailAlreadyExist,
  AuthController.resetPassword
);

router.post("/change-password", AuthController.changePassword);

router.post(
  "/change_password",
  PasswordResetValidator.validateData(),
  PasswordResetValidator.myValidationResult,
  PasswordResetValidator.verifyPasscode,
  AuthController.changePassword
);

router.post(
  "/social_login/google",
  SocialLoginValidator.validateData(),
  SocialLoginValidator.myValidationResult,
  SocialLoginController.socialLoginGoogle
);

router.post(
  "/social_login/google/mobile",
  SocialLoginValidator.validateData(),
  SocialLoginValidator.myValidationResult,
  SocialLoginController.socialLoginGoogleMobile
);

router.post(
  "/social_login/facebook",
  SocialLoginValidator.validateData(),
  SocialLoginValidator.myValidationResult,
  SocialLoginController.socialLoginFacebook
);

router.patch("/profile-update", verifyToken, AuthController.updateProfile);

router.get("/roles", AuthController.getRoles);
router.get("/load-user", verifyToken, AuthController.loadUser);
router.post(
  "/check-join-class",
  CheckUserAndJoin.validateData(),
  CheckUserAndJoin.myValidationResult,
  AuthController.checkUserExistAndJoin
);
router.post(
  "/school/sign-up-for-student",
  SignupForStudent.validateData(),
  SignupForStudent.myValidationResult,
  AuthController.signUpForStudent
);
router.post(
  "/school/sign-up-for-teacher",
  SignupForTeacher.validateData(),
  SignupForTeacher.myValidationResult,
  AuthController.signUpForTeacher
);
router.post(
  "/school/add-user-as-teacher",
  AddUserAsTeacher.validateData(),
  AddUserAsTeacher.myValidationResult,
  AuthController.schoolAddExistingTeacher
);
router.post(
  "/school/add-teacher-as-admin",
  MaketeacherAnAdmin.validateData(),
  MaketeacherAnAdmin.myValidationResult,
  AuthController.makeTeacherAdmin
);
router.post(
  "/parent/add-course-for-child",
  verifyToken,
  AddCourseForChild.validateData(),
  AddCourseForChild.myValidationResult,
  AuthController.enrollChildInCourse
);
router.get(
  "/parent/children",
  verifyToken,
  AuthController.populateParentDashboard
);
router.post(
  "/sign-up-for-a-child",
  SignupForChild.validateData(),
  SignupForChild.myValidationResult,
  AuthController.signUpForChild
);
router.post(
  "/add-user-as-child",
  AddUserAsChild.validateData(),
  AddUserAsChild.myValidationResult,
  AuthController.addExistingUserAsChild
);
router.patch(
  "/unlink-child-account",
  UnlinkChildAccount.validateData(),
  UnlinkChildAccount.myValidationResult,
  AuthController.unlinkChildAccount
);

router.patch(
  "/unlink-children-accounts",
  UnlinkChildrenAccounts.validateData(),
  UnlinkChildrenAccounts.myValidationResult,
  AuthController.unlinkChildrenAccounts
);
router.delete(
  "/delete-children-accounts",
  UnlinkChildrenAccounts.validateData(),
  UnlinkChildrenAccounts.myValidationResult,
  AuthController.deleteChildrenAccounts
);
router.delete(
  "/delete-child-account",
  UnlinkChildAccount.validateData(),
  UnlinkChildAccount.myValidationResult,
  AuthController.deleteChildAccount
);
router.patch(
  "/school/unlink-teacher-account",
  UnlinkStudentAccount.validateData(),
  UnlinkStudentAccount.myValidationResult,
  AuthController.unlinkTeacherAccount
);
router.delete(
  "/school/delete-teacher-account",
  UnlinkStudentAccount.validateData(),
  UnlinkStudentAccount.myValidationResult,
  AuthController.deleteTeacherAccount
);
router.patch(
  "/school/unlink-student-account",
  UnlinkStudentAccount.validateData(),
  UnlinkStudentAccount.myValidationResult,
  AuthController.unlinkStudentAccount
);
router.delete(
  "/school/delete-student-account",
  UnlinkStudentAccount.validateData(),
  UnlinkStudentAccount.myValidationResult,
  AuthController.deleteStudentAccount
);
router.post("/move-users", AuthController.moveUsers);
router.patch(
  "/update-profile-pic",
  upload.single("profilePhotoUrl"),
  verifyToken,
  AuthController.uploadProfilePic
);
router.patch(
  "/school/update-logo/:schoolId",
  upload.single("logo"),
  verifyToken,
  AuthController.uploadSchoolLogo
);
router.patch(
  "/school/update-cover-photo/:schoolId",
  upload.single("coverPhoto"),
  verifyToken,
  AuthController.uploadSchoolCoverPhoto
);
router.patch(
  "/school/update-profile/:schoolId",
  verifyToken,
  AuthController.updateSchoolProfile
);
export default router;
