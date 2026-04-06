import { PasskeyOptionHandler } from './passkey-option.handler';
import { RegisterPasskeyOptionHandler } from './register-passkey-option.handler';
import { VerifyRegistrationOptionHandler } from './verify-registration-option.handler';
import { VerifyPasskeyHandler } from './verify-passkey.handler';
import { RemovePasskeyHandler } from './remove-passkey.handler';

export const passkeyHandlers = [
  PasskeyOptionHandler,
  RegisterPasskeyOptionHandler,
  VerifyRegistrationOptionHandler,
  VerifyPasskeyHandler,
  RemovePasskeyHandler,
];
