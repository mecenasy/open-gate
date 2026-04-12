import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetAllPromptsQuery } from '../impl/get-all-prompts.query';
import { PromptService } from '../../prompt.service';
import { PromptSimply } from 'src/proto/prompt';

@QueryHandler(GetAllPromptsQuery)
export class GetAllPromptsHandler implements IQueryHandler<
  GetAllPromptsQuery,
  { data: PromptSimply[]; total: number }
> {
  constructor(
    private readonly promptService: PromptService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetAllPromptsHandler.name);
  }

  async execute(query: GetAllPromptsQuery): Promise<{ data: PromptSimply[]; total: number }> {
    this.logger.log('Executing GetAllPrompts');

    try {
      const { prompts, total } = await this.promptService.findAll(query.page, query.limit, query.userType);
      return { data: prompts.map((p) => this.promptService.entityToSimplyProto(p)), total };
    } catch (error) {
      this.logger.error('Error executing GetAllPrompts', error);
      throw error;
    }
  }
}
