import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { RemoveMessageCommand } from '../impl/remove-message.command';
import { MessagesService } from '../../messages.service';

@CommandHandler(RemoveMessageCommand)
export class RemoveMessageHandler implements ICommandHandler<RemoveMessageCommand, boolean> {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(RemoveMessageHandler.name);
  }

  execute(command: RemoveMessageCommand): Promise<boolean> {
    this.logger.log('Executing RemoveMessage');

    try {
      return this.messagesService.remove(command.key);
    } catch (error) {
      this.logger.error('Error executing RemoveMessage', error);
      throw error;
    }
  }
}
