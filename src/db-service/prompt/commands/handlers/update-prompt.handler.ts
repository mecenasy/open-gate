import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { UpdatePromptCommand } from '../impl/update-prompt.command';
import { PromptService } from '../../prompt.service';
import { Prompt as PromptProto } from 'src/proto/prompt';

@CommandHandler(UpdatePromptCommand)
export class UpdatePromptHandler implements ICommandHandler<UpdatePromptCommand, PromptProto | null> {
  constructor(
    private readonly promptService: PromptService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(UpdatePromptHandler.name);
  }

  async execute(command: UpdatePromptCommand): Promise<PromptProto | null> {
    this.logger.log('Executing UpdatePrompt');

    try {
      const entity = await this.promptService.update(command.id, command.data);
      return entity ? this.promptService.entityToProto(entity) : null;
    } catch (error) {
      this.logger.error('Error executing UpdatePrompt', error);
      throw error;
    }
  }
}
