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
router.delete(
  "/delete-child-account",
  UnlinkChildAccount.validateData(),
  UnlinkChildAccount.myValidationResult,
  AuthController.deleteChildAccount
);
router.post("/move-users", AuthController.moveUsers);
router.patch(
  "/update-profile-pic",
  upload.single("profilePhotoUrl"),
  verifyToken,
  AuthController.uploadProfilePic
);
export default router;
