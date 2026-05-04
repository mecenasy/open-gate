import { Command } from '@nestjs/cqrs';
import { type ContactBinding } from '@app/entities';

export class VerifyBindingCommand extends Command<ContactBinding | null> {
  constructor(
    public readonly id: string,
    public readonly platformUserId: string,
    public readonly displayName: string | null,
  ) {
    super();
  }
}
