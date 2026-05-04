import { CreateBindingHandler } from './create-binding.handler';
import { UpdateBindingSendStatusHandler } from './update-binding-send-status.handler';
import { VerifyBindingHandler } from './verify-binding.handler';
import { MarkExpiredBindingsHandler } from './mark-expired-bindings.handler';
import { RevokeBindingHandler } from './revoke-binding.handler';

export const contactBindingCommandHandlers = [
  CreateBindingHandler,
  UpdateBindingSendStatusHandler,
  VerifyBindingHandler,
  MarkExpiredBindingsHandler,
  RevokeBindingHandler,
];
