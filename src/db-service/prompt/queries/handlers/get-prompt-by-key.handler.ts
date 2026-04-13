import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetPromptByKeyQuery } from '../impl/get-prompt-by-key.query';
import { PromptService } from '../../prompt.service';
import { Prompt as PromptProto } from 'src/proto/prompt';

@QueryHandler(GetPromptByKeyQuery)
export class GetPromptByKeyHandler extends BaseQueryHandler<GetPromptByKeyQuery, PromptProto | null> {
  constructor(
    private readonly promptService: PromptService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetPromptByKeyQuery): Promise<PromptProto | null> {
    return this.run('GetPromptByKey', async () => {
      const entity = await this.promptService.findByKey(query.key);
      return entity ? this.promptService.entityToProto(entity) : null;
    });
  }
}
