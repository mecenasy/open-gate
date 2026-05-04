import { Command } from '@nestjs/cqrs';
import { type PlatformIdentity } from '@app/entities';

export class TransferIdentityCommand extends Command<PlatformIdentity | null> {
  constructor(
    public readonly id: string,
    public readonly newUserId: string,
    public readonly newPhoneE164: string | null,
  ) {
    super();
  }
}
