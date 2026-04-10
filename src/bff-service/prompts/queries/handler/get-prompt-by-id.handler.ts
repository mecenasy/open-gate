import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { PROMPT_PROXY_SERVICE_NAME, PromptProxyServiceClient } from 'src/proto/prompt';
import { Handler } from '@app/handler';
import { GetPromptByIdQuery } from '../impl/get-prompt.query';
import { PromptResponseType } from '../../dto/response.type';

@QueryHandler(GetPromptByIdQuery)
export class GetPromptHandler extends Handler<GetPromptByIdQuery, PromptResponseType, PromptProxyServiceClient> {
  constructor() {
    super(PROMPT_PROXY_SERVICE_NAME);
  }

  async execute({ id }: GetPromptByIdQuery): Promise<PromptResponseType> {
    // TODO: dorobić logikę zapisywania do cache i odczytywania z cache tak by mozna było pobrać dane po kluczu złozonym key command usertype jak i po id

    const response = await lastValueFrom(this.gRpcService.getPromptById({ id }));

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
