import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { AddPromptCommand } from '../impl/add-prompt.command';
import { PromptService } from '../../prompt.service';
import { Prompt as PromptProto } from 'src/proto/prompt';

@CommandHandler(AddPromptCommand)
export class AddPromptHandler extends BaseCommandHandler<AddPromptCommand, PromptProto> {
  constructor(
    private readonly promptService: PromptService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: AddPromptCommand): Promise<PromptProto> {
    return this.run('AddPrompt', async () => {
      const entity = await this.promptService.create(command.request);
      const result = this.promptService.entityToProto(entity);
      this.logger.log('Prompt added successfully');
      return result;
    });
  }
}
