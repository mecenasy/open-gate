import { Command } from '@nestjs/cqrs';
import { SignalEnvelope } from '../../types';
import { Status } from 'src/gate-service/status/status';

export class MessageCommand extends Command<Status> {
  constructor(public readonly message: SignalEnvelope) {
    super();
  }
}
