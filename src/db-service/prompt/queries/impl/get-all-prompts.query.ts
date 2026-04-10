import { Query } from '@nestjs/cqrs';
import { PromptSimply, UserType } from 'src/proto/prompt';

export class GetAllPromptsQuery extends Query<{ data: PromptSimply[]; total: number }> {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly userType?: UserType,
  ) {
    super();
  }
}
