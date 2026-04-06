import { Module } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsController } from './user-settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSettings } from './entity/user-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserSettings])],
  providers: [UserSettingsService],
  exports: [UserSettingsService],
  controllers: [UserSettingsController],
})
export class UserSettingsModule {}
