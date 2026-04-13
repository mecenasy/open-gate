import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { UpdatePromptCommand } from '../impl/update-prompt.command';
import { PromptService } from '../../prompt.service';
import { Prompt as PromptProto } from 'src/proto/prompt';

@CommandHandler(UpdatePromptCommand)
export class UpdatePromptHandler extends BaseCommandHandler<UpdatePromptCommand, PromptProto | null> {
  constructor(
    private readonly promptService: PromptService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: UpdatePromptCommand): Promise<PromptProto | null> {
    return this.run('UpdatePrompt', async () => {
      const entity = await this.promptService.update(command.id, command.data);
      return entity ? this.promptService.entityToProto(entity) : null;
    });
  }
}
