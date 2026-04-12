import { SendVerifyCodeEventHandler } from './send-verify-code-event.handler';
import { SendResetTokenEventHandler } from './send-reset-token-event.handler';

export const notifyEventHandlers = [SendVerifyCodeEventHandler, SendResetTokenEventHandler];
