import { GetMessageHandler } from './get-message.handler';
import { GetAllMessagesHandler } from './get-all-messages.handler';

export const messageQueryHandlers = [GetMessageHandler, GetAllMessagesHandler];
