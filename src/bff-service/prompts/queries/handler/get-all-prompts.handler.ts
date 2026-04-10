import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { PROMPT_PROXY_SERVICE_NAME, PromptProxyServiceClient } from 'src/proto/prompt';
import { Handler } from '@app/handler';
import { GetAllPromptsQuery } from '../impl/get-all-prompts.query';
import { PromptsListType } from '../../dto/response.type';

@QueryHandler(GetAllPromptsQuery)
export class GetAllPromptsHandler extends Handler<GetAllPromptsQuery, PromptsListType, PromptProxyServiceClient> {
  constructor() {
    super(PROMPT_PROXY_SERVICE_NAME);
  }

  async execute({ page, limit, userType }: GetAllPromptsQuery): Promise<PromptsListType> {
    const response = await lastValueFrom(this.gRpcService.getAllPrompts({ page, limit, userType }));

    if (!response || response.status === false) {
      throw new InternalServerErrorException(response?.message ?? 'Failed to get prompts');
    }

    return {
      status: response.status,
      message: response.message,
      data: response.data.map((p) => ({
        id: p.id,
        key: p.key,
        description: p.description,
        commandName: p.commandName,
        userType: p.userType,
      })),
      total: response.total,
    };
  }
}
