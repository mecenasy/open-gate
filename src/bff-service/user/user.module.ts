import { Module } from '@nestjs/common';
import { userCommands } from './commands/handlers';
import { SettingsModule } from './settings/settings.module';
import { UserCommandResolver } from './user-command.resolver';

@Module({
  imports: [SettingsModule],
  providers: [...userCommands, UserCommandResolver],
})
export class UserModule {}
