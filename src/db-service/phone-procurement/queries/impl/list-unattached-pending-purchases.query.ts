import { Query } from '@nestjs/cqrs';
import type { PendingPhonePurchase } from '@app/entities';

export class ListUnattachedPendingPurchasesQuery extends Query<PendingPhonePurchase[]> {
  constructor(public readonly cutoff: Date) {
    super();
  }
}
