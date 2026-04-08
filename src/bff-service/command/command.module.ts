import { Module } from '@nestjs/common';
import { commandCommands } from './commands/handlers';
import { commandQueries } from './queries/handler';
import { CommandCommandResolver } from './command-command.resolver';
import { CommandQueryResolver } from './command-query.resolver';

@Module({
  providers: [...commandCommands, ...commandQueries, CommandCommandResolver, CommandQueryResolver],
})
export class CommandModule {}
