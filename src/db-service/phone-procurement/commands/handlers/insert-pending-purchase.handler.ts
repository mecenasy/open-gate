import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { PendingPhonePurchase } from '@app/entities';
import { InsertPendingPurchaseCommand } from '../impl/insert-pending-purchase.command';

@CommandHandler(InsertPendingPurchaseCommand)
export class InsertPendingPurchaseHandler extends BaseCommandHandler<
  InsertPendingPurchaseCommand,
  PendingPhonePurchase
> {
  constructor(
    @InjectRepository(PendingPhonePurchase)
    private readonly repo: Repository<PendingPhonePurchase>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: InsertPendingPurchaseCommand): Promise<PendingPhonePurchase> {
    return this.run('InsertPendingPurchase', () =>
      this.repo.save(
        this.repo.create({
          ownerUserId: command.ownerUserId,
          providerKey: command.providerKey,
          providerExternalId: command.providerExternalId,
          phoneE164: command.phoneE164,
          attachedToTenantId: null,
          attachedAt: null,
        }),
      ),
    );
  }
}
