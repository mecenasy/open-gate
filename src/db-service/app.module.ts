import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { PromptModule } from './prompt/prompt.module';
import { UserModule } from './user/user.module';
import { CoreConfigModule } from './core-config/core-config.module';
import { AuthModule } from './auth/auth.module';
import { CommandModule } from './command/command.module';
import { MessagesModule } from './messages/messages.module';
import { TenantDbModule } from './tenant/tenant.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    AuthModule,
    CommonModule,
    UserModule,
    CoreConfigModule,
    PromptModule,
    CommandModule,
    MessagesModule,
    TenantDbModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
