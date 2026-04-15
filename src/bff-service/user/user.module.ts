import { Module } from '@nestjs/common';
import { userCommands } from './commands/handlers';
import { userQueries } from './queries/handler';
import { SettingsModule } from './settings/settings.module';
import { UserCommandResolver } from './user-command.resolver';
import { UserQueryResolver } from './user-query.resolver';
import { AdminGuard } from '../common/guards/admin.guard';

@Module({
  imports: [SettingsModule],
  providers: [...userCommands, ...userQueries, UserCommandResolver, UserQueryResolver, AdminGuard],
})
export class UserModule {}
