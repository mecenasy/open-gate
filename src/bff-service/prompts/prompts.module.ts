import { Module } from '@nestjs/common';
import { promptCommands } from './commands/handlers';
import { promptQueries } from './queries/handler';
import { PromptsCommandResolver } from './prompts-command.resolver';
import { PromptsQueryResolver } from './prompts-query.resolver';

@Module({
  providers: [...promptCommands, ...promptQueries, PromptsCommandResolver, PromptsQueryResolver],
})
export class PromptsModule {}
