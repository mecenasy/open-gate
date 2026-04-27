import { Command } from '@nestjs/cqrs';
import { type PendingPhonePurchase, PhoneProvisionedBy } from '@app/entities';

export class AttachPendingPurchaseCommand extends Command<PendingPhonePurchase | null> {
  constructor(
    public readonly pendingId: string,
    public readonly tenantId: string,
    public readonly provisionedBy: PhoneProvisionedBy,
  ) {
    super();
  }
}
