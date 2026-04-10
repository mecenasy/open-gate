import { LoginHandler } from './login.handler';
import { GetLoginStatusHandler } from './get-login-status.handler';
import { GetUser2FaSecretHandler } from './get-user-2fa-secret.handler';

export const loginQueryHandlers = [LoginHandler, GetLoginStatusHandler, GetUser2FaSecretHandler];
