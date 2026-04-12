import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetPromptByIdQuery } from '../impl/get-prompt-by-id.query';
import { PromptService } from '../../prompt.service';
import { Prompt as PromptProto } from 'src/proto/prompt';

@QueryHandler(GetPromptByIdQuery)
export class GetPromptByIdHandler implements IQueryHandler<GetPromptByIdQuery, PromptProto | null> {
  constructor(
    private readonly promptService: PromptService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetPromptByIdHandler.name);
  }

  async execute(query: GetPromptByIdQuery): Promise<PromptProto | null> {
    this.logger.log('Executing GetPromptById');

    try {
      const entity = await this.promptService.findById(query.id);
      return entity ? this.promptService.entityToProto(entity) : null;
    } catch (error) {
      this.logger.error('Error executing GetPromptById', error);
      throw error;
    }
  }
}
