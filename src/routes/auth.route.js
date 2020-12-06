import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import SignUpValidator from '../validations/auth/signup.validator';
import verifyToken from '../middlewares/auth.middleware';
import LoginValidator from '../validations/auth/login.validator';
import PasswordResetValidator from '../validations/auth/resetPassword.validator';

const router = Router();

router.post(
  '/signup',
  SignUpValidator.validateData(),
  SignUpValidator.myValidationResult,
  SignUpValidator.emailAlreadyExist,
  AuthController.signUp
);

router.get(
    '/activate_account', 
    verifyToken, 
    AuthController.activateAccount
);

router.post(
    '/login',
    LoginValidator.validateData(),
    LoginValidator.myValidationResult,
    AuthController.login
);

router.get(
    '/:email/reset_password',
    PasswordResetValidator.emailAlreadyExist,
    AuthController.resetPassword
);
  

export default router;
