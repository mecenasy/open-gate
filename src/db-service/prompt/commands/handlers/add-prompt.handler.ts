import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { AddPromptCommand } from '../impl/add-prompt.command';
import { PromptService } from '../../prompt.service';
import { Prompt as PromptProto } from 'src/proto/prompt';

@CommandHandler(AddPromptCommand)
export class AddPromptHandler implements ICommandHandler<AddPromptCommand, PromptProto> {
  constructor(
    private readonly promptService: PromptService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(AddPromptHandler.name);
  }

  async execute(command: AddPromptCommand): Promise<PromptProto> {
    this.logger.log('Executing AddPromptCommand');
    try {
      const entity = await this.promptService.create(command.request);
      const result = this.promptService.entityToProto(entity);
      this.logger.log('Prompt added successfully');
      return result;
    } catch (error) {
      this.logger.error('Failed to add prompt', error);
      throw error;
    }
  }
}
