import { AggregateRoot } from '@nestjs/cqrs';
import { SignalMessage } from '../types';

export class SignalMessageEvent extends AggregateRoot {
  constructor(public readonly message: SignalMessage) {
    super();
  }
}
