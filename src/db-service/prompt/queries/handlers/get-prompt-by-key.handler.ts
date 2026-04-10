import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPromptByKeyQuery } from '../impl/get-prompt-by-key.query';
import { PromptService } from '../../prompt.service';
import { Prompt as PromptProto } from 'src/proto/prompt';

@QueryHandler(GetPromptByKeyQuery)
export class GetPromptByKeyHandler implements IQueryHandler<GetPromptByKeyQuery, PromptProto | null> {
  constructor(private readonly promptService: PromptService) {}

  async execute(query: GetPromptByKeyQuery): Promise<PromptProto | null> {
    const entity = await this.promptService.findByKey(query.key);
    return entity ? this.promptService.entityToProto(entity) : null;
  }
}
