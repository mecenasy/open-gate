import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { filter, map, Observable } from 'rxjs';
import { UserMessageCommand } from './pre-process/commands/impl/user-message.command';
import { UserMessageEvent } from './pre-process/events/user-message.event';
import { UnifiedMessageCommand } from './pre-process/commands/impl/message.command';
import { IdentifyMessageEvent } from './pre-process/events/identifier-message.event';
import { MessageToQueueCommand } from './pre-process/commands/impl/message-to-queue.command';
import { UnifiedMessageEvent } from '../message-bridge/event/unified-message.event';

@Injectable()
export class ProcessMessageSaga {
  @Saga()
  identify = (events: Observable<any>): Observable<ICommand> => {
    return events.pipe(
      ofType(UnifiedMessageEvent),
      filter((msg) => Boolean(msg.message)),
      map(({ message }) => new UnifiedMessageCommand(message)),
    );
  };

  @Saga()
  messageIdentify = (events: Observable<any>): Observable<ICommand> => {
    return events.pipe(
      ofType(UserMessageEvent),
      filter((msg) => Boolean(msg.message)),
      map(({ message, context }) => new UserMessageCommand(message, context)),
    );
  };

  @Saga()
  messageToQueue = (events: Observable<any>): Observable<ICommand> => {
    return events.pipe(
      ofType(IdentifyMessageEvent),
      filter((msg) => Boolean(msg.message && msg.context)),
      map(({ message, context }) => new MessageToQueueCommand(message, context)),
    );
  };
}
