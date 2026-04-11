import { ErrorHandler } from './error.handler';
import { GateHandler } from './gate.handler';
import { SoftGateHandler } from './soft-gate.handler';
import { HelpHandler } from './help.handler';
import { CreateUserHandler } from './create-user.handler';

export const commandsHandlers = [ErrorHandler, GateHandler, SoftGateHandler, HelpHandler, CreateUserHandler];
