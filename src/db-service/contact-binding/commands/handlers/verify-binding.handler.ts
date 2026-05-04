import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { ContactBinding, ContactBindingStatus, PlatformIdentity } from '@app/entities';
import { VerifyBindingCommand } from '../impl/verify-binding.command';

@CommandHandler(VerifyBindingCommand)
export class VerifyBindingHandler extends BaseCommandHandler<VerifyBindingCommand, ContactBinding | null> {
  constructor(
    @InjectRepository(ContactBinding)
    private readonly repo: Repository<ContactBinding>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: VerifyBindingCommand): Promise<ContactBinding | null> {
    return this.run('VerifyBinding', () =>
      // Atomic two-step: row-locks the binding to prevent double-verify
      // races (e.g. user replies twice in quick succession), upserts the
      // identity, then flips binding.status. Either both land or neither.
      this.repo.manager.transaction(async (em) => {
        const bindingRepo = em.getRepository(ContactBinding);
        const identityRepo = em.getRepository(PlatformIdentity);

        const binding = await bindingRepo.findOne({
          where: { id: command.id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!binding) return null;
        if (binding.status !== ContactBindingStatus.Pending) return null;
        if (binding.expiresAt <= new Date()) return null;

        const verifiedAt = new Date();

        await identityRepo.upsert(
          {
            tenantId: binding.tenantId,
            userId: binding.userId,
            platform: binding.platform,
            platformUserId: command.platformUserId,
            phoneE164: binding.phoneE164,
            displayName: command.displayName,
            verifiedAt,
            lastSeenAt: verifiedAt,
          },
          { conflictPaths: ['tenantId', 'platform', 'platformUserId'] },
        );
        const identity = await identityRepo.findOneOrFail({
          where: {
            tenantId: binding.tenantId,
            platform: binding.platform,
            platformUserId: command.platformUserId,
          },
        });

        binding.status = ContactBindingStatus.Verified;
        binding.verifiedAt = verifiedAt;
        binding.identityId = identity.id;
        return bindingRepo.save(binding);
      }),
    );
  }
}
