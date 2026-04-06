import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { filter, map, Observable } from 'rxjs';
import { SignalMessageEvent } from './events/signal-message.event';
import { UserMessageCommand } from './commands/impl/user-message.command';
import { UserMessageEvent } from './events/user-message.event';
import { MessageCommand } from './commands/impl/message.command';
import { IdentifyMessageEvent } from './events/identifier-message.event';
import { MessageToQueueCommand } from './commands/impl/message-to-queue.command';

@Injectable()
export class SignalMessageSaga {
  @Saga()
  identify = (events: Observable<any>): Observable<ICommand> => {
    return events.pipe(
      ofType(SignalMessageEvent),
      filter((msg) => Boolean(msg.message)),
      map(({ message }) => new MessageCommand(message.envelope)),
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
