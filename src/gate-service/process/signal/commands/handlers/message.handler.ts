import { Handler } from '../../../../common/handler/handler';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { lastValueFrom } from 'rxjs';
import { UserMessageEvent } from '../../events/user-message.event';
import type { UserContext } from 'src/gate-service/context/user-context';
import { CommandHandler } from '@nestjs/cqrs';
import { MessageCommand } from '../impl/message.command';
import { MessageType, SignalEnvelope } from '../../types';
import { NotificationEvent } from 'src/gate-service/notification/events/notification.event';
import { Status } from 'src/gate-service/status/status';
import { protoToJsUserType } from 'src/utils/user-type-converter';

@CommandHandler(MessageCommand)
export class MassageHandler extends Handler<MessageCommand, Status, UserProxyServiceClient> {
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute({ message }: MessageCommand): Promise<Status> {
    const { source } = message;
    try {
      const foundedUser = await this.cache.getFromCache<UserContext>({
        identifier: source,
        prefix: 'signal-user',
      });

      if (foundedUser) {
        this.sendEvent(message, foundedUser);

        return {
          status: true,
          message: 'User identified from cache',
        };
      }

      const user = await lastValueFrom(this.gRpcService.getUserByPhone({ phone: source }));

      if (!(user && user.status)) {
        this.event.emit(
          new NotificationEvent(
            source,
            'Bardzo Przepraszam ale nie znam cię proszę skontaktuj się z administratorem w celu weryfikacji twojego numeru telefonu',
          ),
        );

        return { status: false, message: 'User not found' };
      }
      if (user && user.data) {
        try {
          await this.cache.saveInCache<UserContext>({
            identifier: source,
            prefix: 'signal-user',
            data: { ...user.data, type: protoToJsUserType(user.data.type) },
          });
        } catch (error) {
          this.logger.error('Error saving user to cache:', error);
        }

        this.sendEvent(message, { ...user.data, type: protoToJsUserType(user.data.type) });
      }
    } catch (error) {
      this.event.emit(
        new NotificationEvent(
          source,
          'Bardzo Przepraszam ale nie znam cię proszę skontaktuj się z administratorem w celu weryfikacji twojego numeru telefonu',
        ),
      );

      this.logger.error('Error in MassageHandler.execute:', error);

      return {
        status: false,
        message: 'Error identifying user',
      };
    }

    return {
      status: true,
      message: 'User identified',
    };
  }

  private sendEvent(message: SignalEnvelope, context: UserContext) {
    this.event.emit(
      new UserMessageEvent(message, {
        ...context,
        messageType: context.messageType ?? MessageType.Unknown,
      }),
    );
  }
}
