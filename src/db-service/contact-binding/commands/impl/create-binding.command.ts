import { Command } from '@nestjs/cqrs';
import { type BindingPlatform, type ContactBinding, type ContactBindingSource } from '@app/entities';

export class CreateBindingCommand extends Command<ContactBinding> {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly phoneE164: string,
    public readonly platform: BindingPlatform,
    public readonly source: ContactBindingSource,
    public readonly ttlMs: number,
  ) {
    super();
  }
}
