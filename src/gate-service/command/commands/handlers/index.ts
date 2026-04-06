import { ErrorHandler } from './error.handler';
import { GateHandler } from './gate.handler';
import { SoftGateHandler } from './soft-gate.handler';

export const commandsHandlers = [ErrorHandler, GateHandler, SoftGateHandler];
