import { Global, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserRole } from './entity/user-role.entity';
import { Command } from '../command/entity/command.entity';
import { PasswordModule } from './password/password.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { HistoryModule } from './history/history.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Command]), PasswordModule, UserSettingsModule, HistoryModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
