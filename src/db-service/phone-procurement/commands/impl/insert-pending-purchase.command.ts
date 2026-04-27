import { Command } from '@nestjs/cqrs';
import type { PendingPhonePurchase } from '@app/entities';

export class InsertPendingPurchaseCommand extends Command<PendingPhonePurchase> {
  constructor(
    public readonly ownerUserId: string,
    public readonly providerKey: string,
    public readonly providerExternalId: string,
    public readonly phoneE164: string,
  ) {
    super();
  }
}
