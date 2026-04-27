import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { PendingPhonePurchase } from '@app/entities';
import { ListUnattachedPendingPurchasesQuery } from '../impl/list-unattached-pending-purchases.query';

@QueryHandler(ListUnattachedPendingPurchasesQuery)
export class ListUnattachedPendingPurchasesHandler extends BaseQueryHandler<
  ListUnattachedPendingPurchasesQuery,
  PendingPhonePurchase[]
> {
  constructor(
    @InjectRepository(PendingPhonePurchase)
    private readonly repo: Repository<PendingPhonePurchase>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: ListUnattachedPendingPurchasesQuery): Promise<PendingPhonePurchase[]> {
    return this.run('ListUnattachedPendingPurchases', () =>
      this.repo.find({
        where: { attachedToTenantId: undefined, purchasedAt: LessThan(query.cutoff) },
      }),
    );
  }
}
