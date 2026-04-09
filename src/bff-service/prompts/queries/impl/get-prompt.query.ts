import { Query } from '@nestjs/cqrs';
import { PromptResponse } from 'src/proto/prompt';

export class GetPromptByIdQuery extends Query<PromptResponse> {
  constructor(public readonly id: string) {
    super();
  }
}
