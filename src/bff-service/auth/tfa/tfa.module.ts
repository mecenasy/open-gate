import { Module } from '@nestjs/common';
import { verify2faCommands } from './commands/handler';
import { Verify2faCodeResolver } from './tfa-command.resolver';

@Module({
  providers: [...verify2faCommands, Verify2faCodeResolver],
})
export class TfaModule {}
