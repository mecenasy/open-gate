import { LoginHandler } from './login.handler';
import { LogoutHandler } from './logout.handler';
import { ForgotPasswordHandler } from './forgot-password.handler';
import { ResetPasswordHandler } from './reset-password.handler';
import { ChangePasswordHandler } from './change-password.handler';

export const loginCommand = [
  LoginHandler,
  LogoutHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  ChangePasswordHandler,
];
