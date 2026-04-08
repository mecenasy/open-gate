import { Command } from '@nestjs/cqrs';
import { PromptResponse } from 'src/proto/prompt';
import { UpdatePromptType } from '../../dto/update-prompt.type';

export class UpdatePromptCommand extends Command<PromptResponse> {
  constructor(public readonly input: UpdatePromptType) {
    super();
  }
}
