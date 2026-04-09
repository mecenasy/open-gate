import { Query } from '@nestjs/cqrs';
import { PromptResponse } from 'src/proto/prompt';

export class GetPromptByKeyQuery extends Query<PromptResponse> {
  constructor(public readonly key: string) {
    super();
  }
}
