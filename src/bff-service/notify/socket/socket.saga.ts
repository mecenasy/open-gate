import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { map, Observable } from 'rxjs';
import { SocketCodeCommand } from './commands/impl/socket-code.command';
import { SendVerifyCodeEvent } from '../common/dto/send-verify-code.event';

@Injectable()
export class SocketSaga {
  constructor() {}
  @Saga()
  sendCode = (events: Observable<SendVerifyCodeEvent>): Observable<ICommand> => {
    return events.pipe(
      ofType(SendVerifyCodeEvent),
      map(({ code }) => new SocketCodeCommand(code)),
    );
  };
}
