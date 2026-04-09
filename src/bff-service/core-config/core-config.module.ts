import { Module } from '@nestjs/common';
import { coreConfigCommands } from './commands/handlers';
import { coreConfigQueries } from './queries/handler';
import { CoreConfigCommandResolver } from './core-config-command.resolver';
import { CoreConfigQueryResolver } from './core-config-query.resolver';
import { OwnerGuard } from '../common/guards/owner.guard';

@Module({
  providers: [
    ...coreConfigCommands,
    ...coreConfigQueries,
    CoreConfigCommandResolver,
    CoreConfigQueryResolver,
    OwnerGuard,
  ],
})
export class CoreConfigModule {}
