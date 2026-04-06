import { Command } from '@nestjs/cqrs';
import { UserContext } from 'src/gate-service/context/user-context';
import { SignalEnvelope } from '../../types';
import { Status } from 'src/gate-service/status/status';

export class MessageToQueueCommand extends Command<Status> {
  constructor(
    public readonly message: SignalEnvelope,
    public readonly context: UserContext,
  ) {
    super();
  }
}
