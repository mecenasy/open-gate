import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { PROMPT_PROXY_SERVICE_NAME, PromptProxyServiceClient } from 'src/proto/prompt';
import { Handler } from 'src/bff-service/common/handler/handler';
import { GetPromptQuery } from '../impl/get-prompt.query';
import { PromptResponseType } from '../../dto/response.type';

@QueryHandler(GetPromptQuery)
export class GetPromptHandler extends Handler<GetPromptQuery, PromptResponseType, PromptProxyServiceClient> {
  constructor() {
    super(PROMPT_PROXY_SERVICE_NAME);
  }

  async execute({ userType }: GetPromptQuery): Promise<PromptResponseType> {
    const response = await lastValueFrom(this.gRpcService.getPrompt({ userType }));

    if (!response || response.status === false || !response.data) {
      throw new NotFoundException(response?.message ?? 'Prompt not found');
    }

    return {
      status: response.status,
      message: response.message,
      data: {
        id: response.data.id,
        key: response.data.key,
        description: response.data.description,
        commandName: response.data.commandName,
        userType: response.data.userType,
        prompt: response.data.prompt,
      },
    };
  }
}
