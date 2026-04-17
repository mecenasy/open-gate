import { SendVerifyCodeEventHandler } from './send-verify-code-event.handler';
import { SendResetTokenEventHandler } from './send-reset-token-event.handler';
import { SendRegistrationTokenEventHandler } from './send-registration-token-event.handler';

export const notifyEventHandlers = [
  SendVerifyCodeEventHandler,
  SendResetTokenEventHandler,
  SendRegistrationTokenEventHandler,
];
