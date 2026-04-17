import { AggregateRoot } from '@nestjs/cqrs';

export class SendRegistrationTokenEvent extends AggregateRoot {
  constructor(
    public readonly email: string,
    public readonly token: string,
  ) {
    super();
    this.autoCommit = true;
  }
}
