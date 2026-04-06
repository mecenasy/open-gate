import { AggregateRoot } from '@nestjs/cqrs';
import { UserContext } from 'src/user-service/context/user-context';
import { SignalEnvelope } from '../types';

export class UserMessageEvent extends AggregateRoot {
  constructor(
    public readonly message: SignalEnvelope,
    public readonly context: UserContext,
  ) {
    super();
  }
}
