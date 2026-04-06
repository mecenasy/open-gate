import { LoginStatusHandler } from './status-auth.handler';
import { VerifyTokensHandler } from './verify-token.handler';

export const loginQueries = [LoginStatusHandler, VerifyTokensHandler];
