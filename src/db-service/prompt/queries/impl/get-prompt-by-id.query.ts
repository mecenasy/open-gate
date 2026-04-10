import { Query } from '@nestjs/cqrs';
import { Prompt as PromptProto } from 'src/proto/prompt';

export class GetPromptByIdQuery extends Query<PromptProto | null> {
  constructor(public readonly id: string) {
    super();
  }
}
