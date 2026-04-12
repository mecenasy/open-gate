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

@CommandHandler(UnifiedMessageEvent)
export class MassageHandler extends Handler<UnifiedMessageEvent, Status, UserProxyServiceClient> {
  messageGrpc: MessagesServiceClient;
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  onModuleInit() {
    super.onModuleInit();
    this.messageGrpc = this.grpcClient.getService<MessagesServiceClient>(MESSAGES_SERVICE_NAME);
  }

  async execute({ message }: UnifiedMessageEvent): Promise<Status> {
    try {
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
