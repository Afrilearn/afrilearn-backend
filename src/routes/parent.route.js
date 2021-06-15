import { Router } from "express";
import verifyToken from "../middlewares/auth.middleware";
import AddCourseForChild from "../validations/auth/addCourseForChild";
import SignupForChild from "../validations/auth/signupForChild.validator";
import AddUserAsChild from "../validations/auth/addUserAsChild.validator";
import UnlinkChildAccount from "../validations/auth/unlinkChildAccount.validator";
import UnlinkChildrenAccounts from "../validations/auth/unlinkChildrenAccounts.validator";
import ParentController from "../controllers/parent.controller";

const router = Router();

router.post(
  "/add-course-for-child",
  verifyToken,
  AddCourseForChild.validateData(),
  AddCourseForChild.myValidationResult,
  ParentController.enrollChildInCourse
);
router.get("/children", verifyToken, ParentController.populateParentDashboard);
router.post(
  "/sign-up-for-a-child",
  SignupForChild.validateData(),
  SignupForChild.myValidationResult,
  ParentController.signUpForChild
);
router.post(
  "/add-user-as-child",
  AddUserAsChild.validateData(),
  AddUserAsChild.myValidationResult,
  ParentController.addExistingUserAsChild
);
router.post(
  "/accept-parent-request",
  AddUserAsChild.validateData(),
  AddUserAsChild.myValidationResult,
  ParentController.acceptParentReuest
);
router.patch(
  "/unlink-child-account",
  UnlinkChildAccount.validateData(),
  UnlinkChildAccount.myValidationResult,
  ParentController.unlinkChildAccount
);

router.patch(
  "/unlink-children-accounts",
  UnlinkChildrenAccounts.validateData(),
  UnlinkChildrenAccounts.myValidationResult,
  ParentController.unlinkChildrenAccounts
);
router.delete(
  "/delete-children-accounts",
  UnlinkChildrenAccounts.validateData(),
  UnlinkChildrenAccounts.myValidationResult,
  ParentController.deleteChildrenAccounts
);
router.delete(
  "/delete-child-account",
  UnlinkChildAccount.validateData(),
  UnlinkChildAccount.myValidationResult,
  ParentController.deleteChildAccount
);

export default router;
