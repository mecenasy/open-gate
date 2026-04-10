import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPromptByIdQuery } from '../impl/get-prompt-by-id.query';
import { PromptService } from '../../prompt.service';
import { Prompt as PromptProto } from 'src/proto/prompt';

@QueryHandler(GetPromptByIdQuery)
export class GetPromptByIdHandler implements IQueryHandler<GetPromptByIdQuery, PromptProto | null> {
  constructor(private readonly promptService: PromptService) {}

  async execute(query: GetPromptByIdQuery): Promise<PromptProto | null> {
    const entity = await this.promptService.findById(query.id);
    return entity ? this.promptService.entityToProto(entity) : null;
  }
}
