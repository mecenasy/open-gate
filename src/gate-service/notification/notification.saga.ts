import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { filter, map, Observable } from 'rxjs';
import { NotificationEvent } from './events/notification.event';
import { NotificationTextCommand } from './commands/impl/notification-text.command';
import { NotificationAudioCommand } from './commands/impl/notification-audio.command';

@Injectable()
export class NotificationSaga {
  @Saga()
  notify = (events: Observable<NotificationEvent>): Observable<ICommand> => {
    return events.pipe(
      ofType(NotificationEvent),
      filter((evt) => Boolean(evt.type === 'text' && typeof evt.message === 'string')),
      map((evt) => new NotificationTextCommand(evt.phone, evt.message as string)),
    );
  };

  @Saga()
  notifyAudio = (events: Observable<NotificationEvent>): Observable<ICommand> => {
    return events.pipe(
      ofType(NotificationEvent),
      filter((evt) => Boolean(evt.type === 'audio' && evt.message instanceof Buffer)),
      map((evt) => new NotificationAudioCommand(evt.phone, Buffer.from(evt.message))),
    );
  };
}
