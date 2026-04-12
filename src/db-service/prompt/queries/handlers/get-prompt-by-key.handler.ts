import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetPromptByKeyQuery } from '../impl/get-prompt-by-key.query';
import { PromptService } from '../../prompt.service';
import { Prompt as PromptProto } from 'src/proto/prompt';

@QueryHandler(GetPromptByKeyQuery)
export class GetPromptByKeyHandler implements IQueryHandler<GetPromptByKeyQuery, PromptProto | null> {
  constructor(
    private readonly promptService: PromptService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetPromptByKeyHandler.name);
  }

  async execute(query: GetPromptByKeyQuery): Promise<PromptProto | null> {
    this.logger.log('Executing GetPromptByKey');

    try {
      const entity = await this.promptService.findByKey(query.key);
      return entity ? this.promptService.entityToProto(entity) : null;
    } catch (error) {
      this.logger.error('Error executing GetPromptByKey', error);
      throw error;
    }
  }
}
