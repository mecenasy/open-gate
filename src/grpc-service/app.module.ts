import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { PromptModule } from './prompt/prompt.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [CommonModule, UserModule, ConfigModule, PromptModule],
})
export class AppModule {}
