import { AddMessageHandler } from './add-message.handler';
import { UpdateMessageHandler } from './update-message.handler';
import { RemoveMessageHandler } from './remove-message.handler';

export const messageCommandHandlers = [AddMessageHandler, UpdateMessageHandler, RemoveMessageHandler];
