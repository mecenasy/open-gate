import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PROMPT_PROXY_SERVICE_NAME, PromptProxyServiceClient } from 'src/proto/prompt';
import { Handler } from 'src/bff-service/common/handler/handler';
import { RemovePromptCommand } from '../impl/remove-prompt.command';
import { PromptSuccessType } from '../../dto/response.type';

@CommandHandler(RemovePromptCommand)
export class RemovePromptHandler extends Handler<RemovePromptCommand, PromptSuccessType, PromptProxyServiceClient> {
  constructor() {
    super(PROMPT_PROXY_SERVICE_NAME);
  }

  async execute({ id }: RemovePromptCommand): Promise<PromptSuccessType> {
    const response = await lastValueFrom(this.gRpcService.removePrompt({ id }));

    if (!response || response.status === false) {
      throw new BadRequestException(response?.message ?? "Sorry we can't remove this prompt");
    }

    return { success: true };
  }
}
