import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { PromptModule } from './prompt/prompt.module';
import { UserModule } from './user/user.module';
import { CoreConfigModule } from './core-config/core-config.module';
import { AuthModule } from './auth/auth.module';
import { CommandModule } from './command/command.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [AuthModule, CommonModule, UserModule, CoreConfigModule, PromptModule, CommandModule, MessagesModule],
})
export class AppModule {}
