import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { CacheService } from '../../common/cache/cache.service';
import { lastValueFrom } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { PROMPT_PROXY_SERVICE_NAME, PromptProxyServiceClient } from '../../../proto/prompt';
import { jsToProtoUserType, isValidJsUserType } from '../../../utils/user-type-converter';
import { GrpcProxyKey } from '../../common/proxy/constance';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

@Injectable()
export class MessageContextService implements OnModuleInit {
  private readonly logger = new Logger(MessageContextService.name);
  private gRpcService: PromptProxyServiceClient;

  constructor(
    private readonly cache: CacheService,
    @Inject(GrpcProxyKey)
    public readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.gRpcService = this.grpcClient.getService<PromptProxyServiceClient>(PROMPT_PROXY_SERVICE_NAME);
    this.logger.log('MessageContextService initialized');
  }

  async getOrCreateConversation(context: { phone: string; type: string }): Promise<ChatCompletionMessageParam[]> {
    const cacheConversation = await this.cache.getFromCache<ChatCompletionMessageParam[]>({
      identifier: context.phone,
      prefix: 'message-context',
    });

    if (cacheConversation) {
      return cacheConversation;
    }

    const prompt = await this.getOrCreatePrompt(context.type);

    const conversation: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: prompt,
      },
    ];

    return conversation;
  }

  async saveConversation(context: { phone: string }, messages: ChatCompletionMessageParam[]): Promise<void> {
    await this.cache.saveInCache<ChatCompletionMessageParam[]>({
      identifier: context.phone,
      prefix: 'message-context',
      data: messages,
    });
  }

  private async getOrCreatePrompt(type: string): Promise<string> {
    let prompt = await this.cache.getFromCache<string>({
      identifier: type,
      prefix: 'prompt',
    });

    if (!prompt) {
      if (!isValidJsUserType(type)) {
        throw new Error(`Invalid user type: ${type}`);
      }

      const promptResponse = await lastValueFrom(this.gRpcService.getPrompt({ promptType: jsToProtoUserType(type) }));
      prompt = promptResponse.data?.prompt ?? '';

      await this.cache.saveInCache<string>({
        identifier: type,
        prefix: 'prompt',
        data: prompt,
        EX: 60 * 60 * 24, // 24 hours
      });
    }

    return prompt;
  }
}
