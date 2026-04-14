import { Injectable, Logger, Inject, OnModuleInit, Optional } from '@nestjs/common';
import { CacheService } from '@app/redis';
import { lastValueFrom } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { PROMPT_PROXY_SERVICE_NAME, PromptProxyServiceClient } from '../../../proto/prompt';
import { TENANT_SERVICE_NAME, TenantServiceClient } from '../../../proto/tenant';
import { isValidJsUserType } from '../../../utils/user-type-converter';
import { DbGrpcKey } from '@app/db-grpc';
import { TenantService } from '@app/tenant';
import { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

export interface ConversationContext {
  phone: string;
  type: string;
  /** Optional: command UUID — if set, a command-specific prompt is resolved */
  commandId?: string;
}

@Injectable()
export class MessageContextService implements OnModuleInit {
  private readonly logger = new Logger(MessageContextService.name);
  private promptGrpcService!: PromptProxyServiceClient;
  private tenantGrpcService!: TenantServiceClient;

  constructor(
    private readonly cache: CacheService,
    @Inject(DbGrpcKey)
    public readonly grpcClient: ClientGrpc,
    @Optional()
    private readonly tenantService?: TenantService,
  ) {}

  onModuleInit() {
    this.promptGrpcService = this.grpcClient.getService<PromptProxyServiceClient>(PROMPT_PROXY_SERVICE_NAME);
    this.tenantGrpcService = this.grpcClient.getService<TenantServiceClient>(TENANT_SERVICE_NAME);
    this.logger.log('MessageContextService initialized');
  }

  async getOrCreateConversation(context: ConversationContext): Promise<ChatCompletionMessageParam[]> {
    const tenantId = this.tenantService?.getContext()?.tenantId;
    const cacheKey = this.buildCacheKey(context.phone, tenantId, context.commandId);

    const cacheConversation = await this.cache.getFromCache<ChatCompletionMessageParam[]>({
      identifier: cacheKey,
      prefix: 'message-context',
    });

    if (cacheConversation) {
      return cacheConversation;
    }

    const prompt = await this.resolvePrompt(context.type, tenantId, context.commandId);

    const conversation: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: prompt,
      },
    ];

    return conversation;
  }

  async saveConversation(context: ConversationContext, messages: ChatCompletionMessageParam[]): Promise<void> {
    const tenantId = this.tenantService?.getContext()?.tenantId;
    const cacheKey = this.buildCacheKey(context.phone, tenantId, context.commandId);

    await this.cache.saveInCache<ChatCompletionMessageParam[]>({
      identifier: cacheKey,
      prefix: 'message-context',
      data: messages,
    });
  }

  private buildCacheKey(phone: string, tenantId?: string, commandId?: string): string {
    const parts = [phone];
    if (tenantId) parts.push(tenantId);
    if (commandId) parts.push(commandId);
    return parts.join(':');
  }

  private async resolvePrompt(userType: string, tenantId?: string, commandId?: string): Promise<string> {
    if (!isValidJsUserType(userType)) {
      throw new Error(`Invalid user type: ${userType}`);
    }

    // 1. Tenant-aware priority chain (requires tenantId)
    if (tenantId) {
      const cacheKey = `${tenantId}:${commandId ?? ''}:${userType}`;
      const cached = await this.cache.getFromCache<string>({ identifier: cacheKey, prefix: 'prompt-ctx' });
      if (cached) return cached;

      try {
        const res = await lastValueFrom(
          this.tenantGrpcService.getPromptForContext({
            tenantId,
            commandId: commandId ?? '',
            userType,
          }),
        );
        if (res.prompt) {
          await this.cache.saveInCache<string>({
            identifier: cacheKey,
            prefix: 'prompt-ctx',
            data: res.prompt,
            EX: 30 * 60, // 30 minutes
          });
          return res.prompt;
        }
      } catch (err) {
        this.logger.warn('getPromptForContext failed, falling back to global prompt', err);
      }
    }

    // 2. Global fallback — legacy key-based lookup (key: 'gate')
    const fallbackCacheKey = userType;
    let prompt = await this.cache.getFromCache<string>({ identifier: fallbackCacheKey, prefix: 'prompt' });

    if (!prompt) {
      const promptResponse = await lastValueFrom(this.promptGrpcService.getPromptByKey({ key: 'gate' }));
      prompt = promptResponse.data?.prompt ?? '';

      await this.cache.saveInCache<string>({
        identifier: fallbackCacheKey,
        prefix: 'prompt',
        data: prompt,
        EX: 60 * 60 * 24,
      });
    }

    return prompt;
  }
}
