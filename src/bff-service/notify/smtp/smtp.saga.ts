import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { map, Observable } from 'rxjs';
import { MailCodeCommand } from './commands/impl/mail-code.command';
import { SendVerifyCodeEvent } from '../common/dto/send-verify-code.event';
import { SendResetTokenEvent } from '../common/dto/send-reset-token.event';
import { ResetTokenCommand } from './commands/impl/reset-token.command';

@Injectable()
export class SmtpSaga {
  constructor() {}

  @Saga()
  sendCode = (events: Observable<SendVerifyCodeEvent>): Observable<ICommand> => {
    return events.pipe(
      ofType(SendVerifyCodeEvent),
      map(({ code, email }) => new MailCodeCommand(email, code)),
    );
  };

  @Saga()
  sendResetToken = (events: Observable<SendResetTokenEvent>): Observable<ICommand> => {
    return events.pipe(
      ofType(SendResetTokenEvent),
      map(({ token, email }) => new ResetTokenCommand(email, token)),
    );
  };
}
