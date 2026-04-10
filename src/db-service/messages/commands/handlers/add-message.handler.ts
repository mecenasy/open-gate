import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddMessageCommand } from '../impl/add-message.command';
import { MessagesService } from '../../messages.service';
import { Message } from 'src/proto/messages';

@CommandHandler(AddMessageCommand)
export class AddMessageHandler implements ICommandHandler<AddMessageCommand, Message> {
  constructor(private readonly messagesService: MessagesService) {}

  async execute(command: AddMessageCommand): Promise<Message> {
    const entity = await this.messagesService.add(command.key, command.value);
    return this.messagesService.entityToProto(entity);
  }
}
