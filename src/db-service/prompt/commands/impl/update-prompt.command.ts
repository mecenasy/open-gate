import { Command } from '@nestjs/cqrs';
import { AddPromptRequest, Prompt as PromptProto } from 'src/proto/prompt';

export class UpdatePromptCommand extends Command<PromptProto | null> {
  constructor(
    public readonly id: string,
    public readonly data: Partial<AddPromptRequest>,
  ) {
    super();
  }
}
