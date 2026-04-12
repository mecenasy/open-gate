import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { AddMessageCommand } from '../impl/add-message.command';
import { MessagesService } from '../../messages.service';
import { Message } from 'src/proto/messages';

@CommandHandler(AddMessageCommand)
export class AddMessageHandler implements ICommandHandler<AddMessageCommand, Message> {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(AddMessageHandler.name);
  }

  async execute(command: AddMessageCommand): Promise<Message> {
    this.logger.log('Executing AddMessage');

    try {
      const entity = await this.messagesService.add(command.key, command.value);
      return this.messagesService.entityToProto(entity);
    } catch (error) {
      this.logger.error('Error executing AddMessage', error);
      throw error;
    }
  }
}
