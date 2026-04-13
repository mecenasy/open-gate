import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { AddMessageCommand } from '../impl/add-message.command';
import { MessagesService } from '../../messages.service';
import { Message } from 'src/proto/messages';

@CommandHandler(AddMessageCommand)
export class AddMessageHandler extends BaseCommandHandler<AddMessageCommand, Message> {
  constructor(
    private readonly messagesService: MessagesService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: AddMessageCommand): Promise<Message> {
    return this.run('AddMessage', async () => {
      const entity = await this.messagesService.add(command.key, command.value);
      return this.messagesService.entityToProto(entity);
    });
  }
}
