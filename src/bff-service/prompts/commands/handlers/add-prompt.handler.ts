import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PROMPT_PROXY_SERVICE_NAME, PromptProxyServiceClient } from 'src/proto/prompt';
import { Handler } from '@app/handler';
import { AddPromptCommand } from '../impl/add-prompt.command';
import { PromptResponseType } from '../../dto/response.type';

@CommandHandler(AddPromptCommand)
export class AddPromptHandler extends Handler<AddPromptCommand, PromptResponseType, PromptProxyServiceClient> {
  constructor() {
    super(PROMPT_PROXY_SERVICE_NAME);
  }

  async execute({ input }: AddPromptCommand): Promise<PromptResponseType> {
    const response = await lastValueFrom(
      this.gRpcService.addPrompt({
        userType: input.userType,
        prompt: input.prompt,
        key: input.key,
        description: input.description,
        commandName: input.commandName,
      }),
    );

    if (!response || response.status === false) {
      throw new BadRequestException(response?.message ?? "Sorry we can't add this prompt");
    }

    return {
      status: response.status,
      message: response.message,
      data: response.data
        ? {
            id: response.data.id,
            key: response.data.key,
            description: response.data.description,
            commandName: response.data.commandName,
            userType: response.data.userType,
            prompt: response.data.prompt,
          }
        : undefined,
    };
  }
}
