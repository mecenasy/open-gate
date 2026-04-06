import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserRole } from './entity/user-role.entity';
import { Command } from '../command/entity/command.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Command])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
