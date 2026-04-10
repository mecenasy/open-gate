import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Messages } from './entity/messages.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { messageCommandHandlers } from './commands/handlers';
import { messageQueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Messages]), CqrsModule],
  controllers: [MessagesController],
  providers: [MessagesService, ...messageCommandHandlers, ...messageQueryHandlers],
  exports: [MessagesService],
})
export class MessagesModule {}
