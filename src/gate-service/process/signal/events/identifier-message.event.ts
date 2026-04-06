import { AggregateRoot } from '@nestjs/cqrs';
import { UserContext } from 'src/gate-service/context/user-context';
import { SignalEnvelope } from '../types';

export class IdentifyMessageEvent extends AggregateRoot {
  constructor(
    public readonly message: SignalEnvelope,
    public readonly context: UserContext,
  ) {
    super();
  }
}
