import { Module } from '@nestjs/common';
import { verifyCommands } from './commands/handler';
import { CommandVerifyMfaResolver } from './mfa-command.resolver';

@Module({
  providers: [...verifyCommands, CommandVerifyMfaResolver],
})
export class MfaModule {}
