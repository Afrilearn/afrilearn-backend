import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import SignUpValidator from '../validations/auth/signup.validator';
import LoginValidator from '../validations/auth/login.validator';
import PasswordResetValidator from '../validations/auth/resetPassword.validator';
import SocialLoginValidator from '../validations/auth/socialLogin.validator';
import AccountActivationValidator from '../validations/auth/accountActivation.validator';
import ResendVerificationValidator from '../validations/auth/resendVerificationCode.validator';
import verifyToken from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/signup',
  SignUpValidator.validateData(),
  SignUpValidator.myValidationResult,
  SignUpValidator.emailAlreadyExist,
  SignUpValidator.usernameAlreadyExist,
  SignUpValidator.phonenumberAlreadyExist,
  AuthController.signUp
);

router.post(
  '/resend-verification',
  ResendVerificationValidator.validateData(),
  ResendVerificationValidator.myValidationResult,
  AuthController.resendVerificationCode
);

router.post(
  '/activate_account',
  AccountActivationValidator.validateData(),
  AccountActivationValidator.myValidationResult,
  AccountActivationValidator.emailAlreadyExist,
  AccountActivationValidator.confirmActivationCode,
  AuthController.activateAccount
);

router.post(
  '/login',
  LoginValidator.validateData(),
  LoginValidator.myValidationResult,
  AuthController.login
);

router.post(
  '/social_login',
  SocialLoginValidator.validateData(),
  SocialLoginValidator.myValidationResult,
  AuthController.socialLogin
);

router.get(
  '/:email/reset_password',
  PasswordResetValidator.emailAlreadyExist,
  AuthController.resetPassword
);

router.post(
  '/change_password',
  PasswordResetValidator.validateData(),
  PasswordResetValidator.myValidationResult,
  PasswordResetValidator.verifyPasscode,
  AuthController.changePassword
);

router.get('/load_user', verifyToken, AuthController.loadUser);

export default router;
