import { AggregateRoot } from '@nestjs/cqrs';

export class SendResetTokenEvent extends AggregateRoot {
  constructor(
    public readonly email: string,
    public readonly token: string,
  ) {
    super();
    this.autoCommit = true;
  }
}
