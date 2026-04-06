import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { filter, map, Observable } from 'rxjs';
import { SendVerifyCodeEvent } from '../common/dto/send-verify-code.event';
import { SmsCodeCommand } from './commands/impl/sms-code.command';

@Injectable()
export class SmsSaga {
  constructor() {}
  @Saga()
  sendCode = (events: Observable<SendVerifyCodeEvent>): Observable<ICommand> => {
    return events.pipe(
      ofType(SendVerifyCodeEvent),
      filter(({ phoneNumber }) => !!phoneNumber),
      map(({ code, phoneNumber }) => new SmsCodeCommand(phoneNumber, code)),
    );
  };
}
