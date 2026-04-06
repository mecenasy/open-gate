import { AggregateRoot } from '@nestjs/cqrs';
import { SignalMessage } from 'src/notify-service/types/types';

export class SignalMessageEvent extends AggregateRoot {
  constructor(public readonly message: SignalMessage) {
    super();
  }
}
