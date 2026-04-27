import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { PendingPhonePurchase, TenantPhoneNumber } from '@app/entities';
import { AttachPendingPurchaseCommand } from '../impl/attach-pending-purchase.command';

@CommandHandler(AttachPendingPurchaseCommand)
export class AttachPendingPurchaseHandler extends BaseCommandHandler<
  AttachPendingPurchaseCommand,
  PendingPhonePurchase | null
> {
  constructor(
    @InjectRepository(PendingPhonePurchase)
    private readonly pendingRepo: Repository<PendingPhonePurchase>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: AttachPendingPurchaseCommand): Promise<PendingPhonePurchase | null> {
    return this.run('AttachPendingPurchase', () =>
      // Atomic two-step: marks the pending row as attached AND inserts the
      // matching tenant_phone_numbers row. Either both succeed or neither —
      // a half-attached purchase would leave the operator and our state out
      // of agreement.
      this.pendingRepo.manager.transaction(async (em) => {
        const pendingRepo = em.getRepository(PendingPhonePurchase);
        const tenantPhoneRepo = em.getRepository(TenantPhoneNumber);
        const pending = await pendingRepo.findOne({ where: { id: command.pendingId } });
        if (!pending || pending.attachedToTenantId) return null;

        pending.attachedToTenantId = command.tenantId;
        pending.attachedAt = new Date();
        await pendingRepo.save(pending);

        await tenantPhoneRepo.save(
          tenantPhoneRepo.create({
            tenantId: command.tenantId,
            phoneE164: pending.phoneE164,
            providerKey: pending.providerKey,
            providerExternalId: pending.providerExternalId,
            provisionedBy: command.provisionedBy,
          }),
        );
        return pending;
      }),
    );
  }
}
