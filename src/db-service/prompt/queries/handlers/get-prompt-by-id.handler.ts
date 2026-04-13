import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetPromptByIdQuery } from '../impl/get-prompt-by-id.query';
import { PromptService } from '../../prompt.service';
import { Prompt as PromptProto } from 'src/proto/prompt';

@QueryHandler(GetPromptByIdQuery)
export class GetPromptByIdHandler extends BaseQueryHandler<GetPromptByIdQuery, PromptProto | null> {
  constructor(
    private readonly promptService: PromptService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetPromptByIdQuery): Promise<PromptProto | null> {
    return this.run('GetPromptById', async () => {
      const entity = await this.promptService.findById(query.id);
      return entity ? this.promptService.entityToProto(entity) : null;
    });
  }
}
