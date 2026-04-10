import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Command } from './entity/command.entity';
import { UserRole } from '../user/entity/user-role.entity';
import { User } from '../user/entity/user.entity';
import { CommandService } from './command.service';
import { CommandGrpcController } from './command.controller';
import { commandCommandHandlers } from './commands/handlers';
import { commandQueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Command, UserRole, User]), CqrsModule],
  controllers: [CommandGrpcController],
  providers: [CommandService, ...commandCommandHandlers, ...commandQueryHandlers],
  exports: [CommandService],
})
export class CommandModule {}
