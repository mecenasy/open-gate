import { Command } from '@nestjs/cqrs';
import { type BindingPlatform, type PlatformIdentity } from '@app/entities';

export class UpsertPlatformIdentityCommand extends Command<PlatformIdentity> {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly platform: BindingPlatform,
    public readonly platformUserId: string,
    public readonly phoneE164: string | null,
    public readonly displayName: string | null,
    public readonly verifiedAt: Date,
  ) {
    super();
  }
}
