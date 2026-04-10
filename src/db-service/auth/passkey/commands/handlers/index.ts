import { AddPasskeyHandler } from './add-passkey.handler';
import { RemovePasskeyHandler } from './remove-passkey.handler';
import { SetCounterHandler } from './set-counter.handler';

export const passkeyCommandHandlers = [AddPasskeyHandler, RemovePasskeyHandler, SetCounterHandler];
