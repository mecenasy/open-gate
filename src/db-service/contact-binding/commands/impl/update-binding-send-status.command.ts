import { Command } from '@nestjs/cqrs';
import { type ContactBinding, type ContactBindingSendStatus } from '@app/entities';

export class UpdateBindingSendStatusCommand extends Command<ContactBinding | null> {
  constructor(
    public readonly id: string,
    public readonly sendStatus: ContactBindingSendStatus,
    public readonly outboundMessageId: string | null,
    public readonly sendError: string | null,
  ) {
    super();
  }
}
