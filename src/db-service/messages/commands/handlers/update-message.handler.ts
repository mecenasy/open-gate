import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { UpdateMessageCommand } from '../impl/update-message.command';
import { MessagesService } from '../../messages.service';
import { Message } from 'src/proto/messages';

@CommandHandler(UpdateMessageCommand)
export class UpdateMessageHandler implements ICommandHandler<UpdateMessageCommand, Message | null> {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(UpdateMessageHandler.name);
  }

  async execute(command: UpdateMessageCommand): Promise<Message | null> {
    this.logger.log('Executing UpdateMessage');

    try {
      const entity = await this.messagesService.update(command.key, command.value);
      return entity ? this.messagesService.entityToProto(entity) : null;
    } catch (error) {
      this.logger.error('Error executing UpdateMessage', error);
      throw error;
    }
  }
}
