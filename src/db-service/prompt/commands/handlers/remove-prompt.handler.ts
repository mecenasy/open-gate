import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { RemovePromptCommand } from '../impl/remove-prompt.command';
import { PromptService } from '../../prompt.service';

@CommandHandler(RemovePromptCommand)
export class RemovePromptHandler extends BaseCommandHandler<RemovePromptCommand, boolean> {
  constructor(
    private readonly promptService: PromptService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: RemovePromptCommand): Promise<boolean> {
    return this.run('RemovePrompt', () => this.promptService.remove(command.id));
  }
}
