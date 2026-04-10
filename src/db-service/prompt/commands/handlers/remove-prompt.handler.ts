import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemovePromptCommand } from '../impl/remove-prompt.command';
import { PromptService } from '../../prompt.service';

@CommandHandler(RemovePromptCommand)
export class RemovePromptHandler implements ICommandHandler<RemovePromptCommand, boolean> {
  constructor(private readonly promptService: PromptService) {}

  execute(command: RemovePromptCommand): Promise<boolean> {
    return this.promptService.remove(command.id);
  }
}
