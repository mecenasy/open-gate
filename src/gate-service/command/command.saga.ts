import { Injectable, Logger } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { filter, mergeMap, Observable } from 'rxjs';
import { SofCommand } from './commands/impl/sof-command';
import { SofCommandEvent } from './events/sof-command.event';
import { SofDispatcher } from './dispatcher';
import { CommandType } from 'src/bff-service/command/dto/command.type';

@Injectable()
export class CommandSaga {
  logger: Logger;
  constructor(private readonly dispatcher: SofDispatcher<number>) {
    this.logger = new Logger(this.constructor.name);
  }

  @Saga()
  identify = (events: Observable<any>): Observable<ICommand> => {
    return events.pipe(
      ofType(SofCommandEvent<number>),
      filter((msg) => Boolean(msg.command && msg.context)),
      mergeMap(async ({ command, context }) => {
        return await this.dispatcher.dispatch(new SofCommand<number>(command.command, command, context));
      }),
      filter(() => false),
    );
  };
}
