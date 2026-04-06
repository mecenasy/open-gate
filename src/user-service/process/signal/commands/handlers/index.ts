import { MassageHandler } from './message.handler';
import { MassageIdentifierHandler } from './message-identifier.handler';
import { MessageToQueueHandler } from './message-to-queue..handler';

export const commandsHandlers = [MassageIdentifierHandler, MassageHandler, MessageToQueueHandler];
