import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { PendingPhonePurchase } from '@app/entities';
import { GetPendingPurchaseQuery } from '../impl/get-pending-purchase.query';

@QueryHandler(GetPendingPurchaseQuery)
export class GetPendingPurchaseHandler extends BaseQueryHandler<GetPendingPurchaseQuery, PendingPhonePurchase | null> {
  constructor(
    @InjectRepository(PendingPhonePurchase)
    private readonly repo: Repository<PendingPhonePurchase>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetPendingPurchaseQuery): Promise<PendingPhonePurchase | null> {
    return this.run('GetPendingPurchase', () => this.repo.findOne({ where: { id: query.pendingId } }));
  }
}
