import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetAllPromptsQuery } from '../impl/get-all-prompts.query';
import { PromptService } from '../../prompt.service';
import { PromptSimply } from 'src/proto/prompt';

@QueryHandler(GetAllPromptsQuery)
export class GetAllPromptsHandler extends BaseQueryHandler<
  GetAllPromptsQuery,
  { data: PromptSimply[]; total: number }
> {
  constructor(
    private readonly promptService: PromptService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetAllPromptsQuery): Promise<{ data: PromptSimply[]; total: number }> {
    return this.run('GetAllPrompts', async () => {
      const { prompts, total } = await this.promptService.findAll(query.page, query.limit, query.userType);
      return { data: prompts.map((p) => this.promptService.entityToSimplyProto(p)), total };
    });
  }
}
