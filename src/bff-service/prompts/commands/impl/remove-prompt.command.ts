import { Command } from '@nestjs/cqrs';
import { PromptResponse } from 'src/proto/prompt';

export class RemovePromptCommand extends Command<PromptResponse> {
  constructor(public readonly id: string) {
    super();
  }
}
