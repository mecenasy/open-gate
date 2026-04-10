import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveMessageCommand } from '../impl/remove-message.command';
import { MessagesService } from '../../messages.service';

@CommandHandler(RemoveMessageCommand)
export class RemoveMessageHandler implements ICommandHandler<RemoveMessageCommand, boolean> {
  constructor(private readonly messagesService: MessagesService) {}

  execute(command: RemoveMessageCommand): Promise<boolean> {
    return this.messagesService.remove(command.key);
  }
}
