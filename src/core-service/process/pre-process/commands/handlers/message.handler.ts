import { Handler } from '@app/handler';
import { USER_PROXY_SERVICE_NAME, UserData, UserProxyServiceClient } from 'src/proto/user';
import { MESSAGES_SERVICE_NAME, MessagesServiceClient } from 'src/proto/messages';
import { lastValueFrom } from 'rxjs';
import { UserMessageEvent } from '../../events/user-message.event';
import type { UserContext } from 'src/core-service/context/user-context';
import { CommandHandler } from '@nestjs/cqrs';
import { UnifiedMessageEvent } from '../impl/unified-message.command';
import { MessageType } from '../../types';
import { NotificationEvent } from 'src/core-service/notification/events/notification.event';
import { Status } from 'src/core-service/status/status';
import { protoToJsUserType } from 'src/utils/user-type-converter';
import { protoToUserStatus } from 'src/utils/concert-status';
import { RedisData, SaveRedisData } from '@app/redis/model/redis-data';
import { keys } from 'src/core-service/message-keys/keys';
import { UserType } from 'src/db-service/user/user-type';
import { UserStatus } from 'src/db-service/user/status';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';
import { Inject, Optional } from '@nestjs/common';
import { TenantCustomizationService } from 'src/core-service/common/customization/tenant-customization.service';
import { Platform } from 'src/notify-service/types/platform';

@CommandHandler(UnifiedMessageEvent)
export class MassageHandler extends Handler<UnifiedMessageEvent, Status, UserProxyServiceClient> {
  messageGrpc: MessagesServiceClient;

  constructor(
    @Optional()
    @Inject(TenantCustomizationService)
    private readonly customizationService?: TenantCustomizationService,
  ) {
    super(USER_PROXY_SERVICE_NAME);
  }

  onModuleInit() {
    super.onModuleInit();
    this.messageGrpc = this.grpcClient.getService<MessagesServiceClient>(MESSAGES_SERVICE_NAME);
  }

  async execute({ message }: UnifiedMessageEvent): Promise<Status> {
    console.log('🚀 ~ MassageHandler ~ execute ~ message:', message);
    try {
      if (await this.isPlatformDisabled(message.platform)) {
        await this.notifyPlatformDisabled(message);
        return { status: false, message: 'Platform disabled for this tenant' };
      }

      const userContext = await this.getOrFetchUser({
        identifier: message.chatId,
        prefix: 'user',
      });

      if (!userContext) {
        if (message.content?.includes('/')) {
          this.sendEvent(message, { phone: message.chatId, type: UserType.Unrecognized, status: UserStatus.Pending });
        } else {
          await this.notifyUnknownUser(message);
        }

        return { status: false, message: 'User not found' };
      }

      this.sendEvent(message, userContext);

      return {
        status: true,
        message: 'User processed successfully',
      };
    } catch (error) {
      this.logger.error('Error in MassageHandler.execute:', error);
      await this.notifyUnknownUser(message);
      return { status: false, message: 'Error identifying user' };
    }
  }

  private async getOrFetchUser(data: RedisData): Promise<UserContext | null> {
    try {
      const cached = await this.cache.getFromCache<UserContext>(data);

      if (cached) {
        return cached;
      }

      const response = await lastValueFrom(this.gRpcService.getUserByPhone({ phone: data.identifier }));

      if (!response?.status || !response?.data) {
        return null;
      }

      const userContext = this.mapProtoToContext(response.data);

      await this.saveUserToCache({
        identifier: userContext.phone,
        data: userContext,
        EX: 3600,
        prefix: 'user',
      });

      return userContext;
    } catch (error) {
      this.logger.error('Cache save failed', error);
      return null;
    }
  }

  private mapProtoToContext(data: UserData): UserContext {
    return {
      ...data,
      type: protoToJsUserType(data.type),
      status: protoToUserStatus(data.status),
    };
  }

  private async saveUserToCache(data: SaveRedisData<UserContext>): Promise<void> {
    await this.cache.saveInCache<UserContext>(data);
  }

  private async notifyUnknownUser(message: UnifiedMessage): Promise<void> {
    this.event.emit(
      new NotificationEvent({
        phone: message.chatId,
        message: (await this.getMessage()) ?? 'User not found',
        platform: message.platform,
      }),
    );
  }

  private sendEvent(message: UnifiedMessage, context: UserContext) {
    this.event.emit(
      new UserMessageEvent(message, {
        ...context,
        messageType: context.messageType ?? MessageType.Unknown,
      }),
    );
  }

  private async isPlatformDisabled(platform: Platform): Promise<boolean> {
    if (!this.customizationService) {
      return false;
    }
    const features = (await this.customizationService.getForCurrentTenant()).features;
    if (platform === Platform.Signal && !features.enableSignal) return true;
    if (platform === Platform.Whatsapp && !features.enableWhatsApp) return true;
    if (platform === Platform.Messenger && !features.enableMessenger) return true;
    return false;
  }

  private async notifyPlatformDisabled(message: UnifiedMessage): Promise<void> {
    const text = await this.getPlatformDisabledMessage();
    this.event.emit(new NotificationEvent({ phone: message.chatId, message: text, platform: message.platform }));
  }

  private async getPlatformDisabledMessage(): Promise<string> {
    const cached = await this.cache.getFromCache<string>({
      identifier: 'message',
      path: keys.platformDisabledKey,
    });
    if (cached) return cached;

    const response = await lastValueFrom(this.messageGrpc.getMessage({ key: keys.platformDisabledKey }));
    const text = response?.status && response?.data ? response.data.value : 'This service is not available.';

    await this.cache.saveInCache<string>({
      identifier: 'message',
      path: keys.platformDisabledKey,
      data: text,
      EX: 24 * 60 * 60,
    });
    return text;
  }

  private async getMessage() {
    const message = await this.cache.getFromCache<string>({
      identifier: 'message',
      path: keys.phoneNotFoundKey,
    });

    if (message) {
      return message;
    }

    const response = await lastValueFrom(this.messageGrpc.getMessage({ key: keys.phoneNotFoundKey }));

    if (!response?.status || !response?.data) {
      return '';
    }

    await this.cache.saveInCache<string>({
      identifier: 'message',
      path: keys.phoneNotFoundKey,
      data: response.data.value,
      EX: 24 * 60 * 60,
    });

    return response.data.value;
  }
}
