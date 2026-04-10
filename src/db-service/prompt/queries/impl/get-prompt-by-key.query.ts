import { Query } from '@nestjs/cqrs';
import { Prompt as PromptProto } from 'src/proto/prompt';

export class GetPromptByKeyQuery extends Query<PromptProto | null> {
  constructor(public readonly key: string) {
    super();
  }
}
