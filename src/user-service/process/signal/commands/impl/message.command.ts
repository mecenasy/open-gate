import { Command } from '@nestjs/cqrs';
import { SignalEnvelope } from '../../types';
import { Status } from 'src/user-service/status/status';

export class MessageCommand extends Command<Status> {
  constructor(public readonly message: SignalEnvelope) {
    super();
  }
}
