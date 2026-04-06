import { AggregateRoot } from '@nestjs/cqrs';

export class SendVerifyCodeEvent extends AggregateRoot {
  constructor(
    public readonly phoneNumber: string,
    public readonly email: string,
    public readonly code: number,
  ) {
    super();
    this.autoCommit = true;
  }
}
