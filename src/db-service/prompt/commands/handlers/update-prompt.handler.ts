import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePromptCommand } from '../impl/update-prompt.command';
import { PromptService } from '../../prompt.service';
import { Prompt as PromptProto } from 'src/proto/prompt';

@CommandHandler(UpdatePromptCommand)
export class UpdatePromptHandler implements ICommandHandler<UpdatePromptCommand, PromptProto | null> {
  constructor(private readonly promptService: PromptService) {}

  async execute(command: UpdatePromptCommand): Promise<PromptProto | null> {
    const entity = await this.promptService.update(command.id, command.data);
    return entity ? this.promptService.entityToProto(entity) : null;
  }
}
