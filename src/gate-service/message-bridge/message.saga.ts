import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { filter, map, Observable } from 'rxjs';
import { MessageEvent } from './event/message.event';
import { MessageCommand } from './impl/message.command';

@Injectable()
export class MessageSaga {
  @Saga()
  identify = (events: Observable<any>): Observable<ICommand> => {
    return events.pipe(
      ofType(MessageEvent),
      filter((msg) => Boolean(msg.message && msg.platform)),
      map(({ message, platform }) => new MessageCommand(message, platform)),
    );
  };
}
