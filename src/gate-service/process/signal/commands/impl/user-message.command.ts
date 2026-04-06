import { UserContext } from 'src/gate-service/context/user-context';
import { SignalEnvelope } from '../../types';
import { Command } from '@nestjs/cqrs';
import { Status } from 'src/gate-service/status/status';

export class UserMessageCommand extends Command<Status> {
  constructor(
    public readonly message: SignalEnvelope,
    public readonly context: UserContext,
  ) {
    super();
  }
}
