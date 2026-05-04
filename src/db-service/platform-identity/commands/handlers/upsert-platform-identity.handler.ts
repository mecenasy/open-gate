import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { PlatformIdentity } from '@app/entities';
import { UpsertPlatformIdentityCommand } from '../impl/upsert-platform-identity.command';

@CommandHandler(UpsertPlatformIdentityCommand)
export class UpsertPlatformIdentityHandler extends BaseCommandHandler<UpsertPlatformIdentityCommand, PlatformIdentity> {
  constructor(
    @InjectRepository(PlatformIdentity)
    private readonly repo: Repository<PlatformIdentity>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: UpsertPlatformIdentityCommand): Promise<PlatformIdentity> {
    return this.run('UpsertPlatformIdentity', async () => {
      // ON CONFLICT path covers the "same UUID re-bound to a different
      // user" case (A4 transfer): user changed phone but kept Signal
      // account → row stays, user_id and phone update in place.
      await this.repo.upsert(
        {
          tenantId: command.tenantId,
          userId: command.userId,
          platform: command.platform,
          platformUserId: command.platformUserId,
          phoneE164: command.phoneE164,
          displayName: command.displayName,
          verifiedAt: command.verifiedAt,
          lastSeenAt: command.verifiedAt,
        },
        { conflictPaths: ['tenantId', 'platform', 'platformUserId'] },
      );
      return this.repo.findOneOrFail({
        where: {
          tenantId: command.tenantId,
          platform: command.platform,
          platformUserId: command.platformUserId,
        },
      });
    });
  }
}
