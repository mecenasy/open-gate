import { Command } from '@nestjs/cqrs';
import { AddPromptRequest, Prompt as PromptProto } from 'src/proto/prompt';

export class AddPromptCommand extends Command<PromptProto> {
  constructor(public readonly request: AddPromptRequest) {
    super();
  }
}
