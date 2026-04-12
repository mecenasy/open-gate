import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { RemovePromptCommand } from '../impl/remove-prompt.command';
import { PromptService } from '../../prompt.service';

@CommandHandler(RemovePromptCommand)
export class RemovePromptHandler implements ICommandHandler<RemovePromptCommand, boolean> {
  constructor(
    private readonly promptService: PromptService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(RemovePromptHandler.name);
  }

  execute(command: RemovePromptCommand): Promise<boolean> {
    this.logger.log('Executing RemovePrompt');

    try {
      return this.promptService.remove(command.id);
    } catch (error) {
      this.logger.error('Error executing RemovePrompt', error);
      throw error;
    }
  }
}
