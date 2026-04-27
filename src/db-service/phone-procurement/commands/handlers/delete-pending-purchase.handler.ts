import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { PendingPhonePurchase } from '@app/entities';
import { DeletePendingPurchaseCommand } from '../impl/delete-pending-purchase.command';

@CommandHandler(DeletePendingPurchaseCommand)
export class DeletePendingPurchaseHandler extends BaseCommandHandler<DeletePendingPurchaseCommand, void> {
  constructor(
    @InjectRepository(PendingPhonePurchase)
    private readonly repo: Repository<PendingPhonePurchase>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: DeletePendingPurchaseCommand): Promise<void> {
    return this.run('DeletePendingPurchase', async () => {
      await this.repo.delete({ id: command.pendingId });
    });
  }
}
