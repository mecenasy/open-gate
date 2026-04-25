import { Module } from '@nestjs/common';
import { commandCommands } from './commands/handlers';
import { commandQueries } from './queries/handler';
import { CommandCommandResolver } from './command-command.resolver';
import { CommandQueryResolver } from './command-query.resolver';
import { PlatformAdminGuard } from '../common/guards/platform-admin.guard';
import { QuotasBffModule } from '../quotas/quotas.module';
import { TenantBffModule } from '../tenant/tenant.module';

@Module({
  imports: [QuotasBffModule, TenantBffModule],
  providers: [
    ...commandCommands,
    ...commandQueries,
    CommandCommandResolver,
    CommandQueryResolver,
    PlatformAdminGuard,
  ],
})
export class CommandModule {}
