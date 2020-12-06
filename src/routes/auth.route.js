import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import SignUpValidator from '../validations/auth/signup.validator';
import verifyToken from '../middlewares/auth.middleware';
import LoginValidator from '../validations/auth/login.validator';

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
  

export default router;
