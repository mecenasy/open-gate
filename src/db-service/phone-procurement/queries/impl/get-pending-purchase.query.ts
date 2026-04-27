import { Query } from '@nestjs/cqrs';
import type { PendingPhonePurchase } from '@app/entities';

export class GetPendingPurchaseQuery extends Query<PendingPhonePurchase | null> {
  constructor(public readonly pendingId: string) {
    super();
  }
}
