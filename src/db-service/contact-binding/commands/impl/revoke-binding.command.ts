import { Command } from '@nestjs/cqrs';
import { type ContactBinding } from '@app/entities';

export class RevokeBindingCommand extends Command<ContactBinding | null> {
  constructor(public readonly id: string) {
    super();
  }
}
