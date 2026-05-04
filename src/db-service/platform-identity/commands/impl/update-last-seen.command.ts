import { Command } from '@nestjs/cqrs';

export class UpdateLastSeenCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly seenAt: Date,
  ) {
    super();
  }
}
