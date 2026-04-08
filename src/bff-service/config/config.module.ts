import { Module } from '@nestjs/common';
import { configCommands } from './commands/handlers';
import { configQueries } from './queries/handler';
import { ConfigCommandResolver } from './config-command.resolver';
import { ConfigQueryResolver } from './config-query.resolver';

@Module({
  providers: [...configCommands, ...configQueries, ConfigCommandResolver, ConfigQueryResolver],
})
export class ConfigModule {}
