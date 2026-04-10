import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateMessageCommand } from '../impl/update-message.command';
import { MessagesService } from '../../messages.service';
import { Message } from 'src/proto/messages';

@CommandHandler(UpdateMessageCommand)
export class UpdateMessageHandler implements ICommandHandler<UpdateMessageCommand, Message | null> {
  constructor(private readonly messagesService: MessagesService) {}

  async execute(command: UpdateMessageCommand): Promise<Message | null> {
    const entity = await this.messagesService.update(command.key, command.value);
    return entity ? this.messagesService.entityToProto(entity) : null;
  }
}
