import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { PromptModule } from './prompt/prompt.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { CommandModule } from './command/command.module';

@Module({
  imports: [AuthModule, CommonModule, UserModule, ConfigModule, PromptModule, CommandModule],
})
export class AppModule {}
