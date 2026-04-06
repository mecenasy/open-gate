import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Command } from './entity/command.entity';
import { UserRole } from '../user/entity/user-role.entity';
import { User } from '../user/entity/user.entity';
import { CommandService } from './command.service';
import { CommandGrpcController } from './command.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Command, UserRole, User])],
  controllers: [CommandGrpcController],
  providers: [CommandService],
  exports: [CommandService],
})
export class CommandModule {}
