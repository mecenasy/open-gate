import { UserContext } from 'src/user-service/context/user-context';
import { SignalEnvelope } from '../../types';
import { Command } from '@nestjs/cqrs';
import { Status } from 'src/user-service/status/status';

export class UserMessageCommand extends Command<Status> {
  constructor(
    public readonly message: SignalEnvelope,
    public readonly context: UserContext,
  ) {
    super();
  }
}
