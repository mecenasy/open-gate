import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddPromptCommand } from '../impl/add-prompt.command';
import { PromptService } from '../../prompt.service';
import { Prompt as PromptProto } from 'src/proto/prompt';

@CommandHandler(AddPromptCommand)
export class AddPromptHandler implements ICommandHandler<AddPromptCommand, PromptProto> {
  constructor(private readonly promptService: PromptService) {}

  async execute(command: AddPromptCommand): Promise<PromptProto> {
    const entity = await this.promptService.create(command.request);
    return this.promptService.entityToProto(entity);
  }
}
