import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllPromptsQuery } from '../impl/get-all-prompts.query';
import { PromptService } from '../../prompt.service';
import { PromptSimply } from 'src/proto/prompt';

@QueryHandler(GetAllPromptsQuery)
export class GetAllPromptsHandler implements IQueryHandler<
  GetAllPromptsQuery,
  { data: PromptSimply[]; total: number }
> {
  constructor(private readonly promptService: PromptService) {}

  async execute(query: GetAllPromptsQuery): Promise<{ data: PromptSimply[]; total: number }> {
    const { prompts, total } = await this.promptService.findAll(query.page, query.limit, query.userType);
    return { data: prompts.map((p) => this.promptService.entityToSimplyProto(p)), total };
  }
}
