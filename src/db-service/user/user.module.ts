import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { UserRole } from './entity/user-role.entity';
import { Command } from '../command/entity/command.entity';
import { PasswordModule } from './password/password.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { HistoryModule } from './history/history.module';
import { userCommandHandlers } from './commands/handlers';
import { userQueryHandlers } from './queries/handlers';
import { RegistrationCleanupService } from './cleanup/registration-cleanup.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Command]),
    CqrsModule,
    ScheduleModule.forRoot(),
    PasswordModule,
    UserSettingsModule,
    HistoryModule,
  ],
  controllers: [UserController],
  providers: [UserService, ...userCommandHandlers, ...userQueryHandlers, RegistrationCleanupService],
  exports: [UserService],
})
export class UserModule {}
