import { Command } from '@nestjs/cqrs';
import { PromptResponse } from 'src/proto/prompt';
import { AddPromptType } from '../../dto/add-prompt.type';

export class AddPromptCommand extends Command<PromptResponse> {
  constructor(public readonly input: AddPromptType) {
    super();
  }
}
