import { GetBindingHandler } from './get-binding.handler';
import { FindBindingByTokenHandler } from './find-binding-by-token.handler';
import { FindBindingByOutboundMessageIdHandler } from './find-binding-by-outbound-message-id.handler';
import { ListPendingBindingsHandler } from './list-pending-bindings.handler';

export const contactBindingQueryHandlers = [
  GetBindingHandler,
  FindBindingByTokenHandler,
  FindBindingByOutboundMessageIdHandler,
  ListPendingBindingsHandler,
];
