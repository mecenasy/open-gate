import { Module } from '@nestjs/common';
import { commandHandlers } from './commands/handler';
import { SettingsCommandResolver } from './settings-command.resolver';

@Module({
  providers: [...commandHandlers, SettingsCommandResolver],
})
export class SettingsModule {}
