import { Module } from '@nestjs/common';
import { passkeyHandlers } from './commands/handler';
import { passkeyQueries } from './queries/handler';
import { PasskeyQueriesResolver } from './passkey-query.resolver';
import { PasskeyCommandsResolver } from './passkey-command.resolver';

@Module({
  providers: [...passkeyHandlers, ...passkeyQueries, PasskeyQueriesResolver, PasskeyCommandsResolver],
})
export class PasskeyModule {}
