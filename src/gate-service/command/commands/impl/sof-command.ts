import { Command } from '@nestjs/cqrs';
import { CommandType, SofCommand as SofCommandType } from 'src/gate-service/common/types/command';
import { UserContext } from 'src/gate-service/context/user-context';
import { Status } from 'src/gate-service/status/status';
import { Platform } from 'src/notify-service/types/platform';

export class SofCommand<T> extends Command<Status> {
  constructor(
    public readonly type: CommandType,
    public readonly command: SofCommandType<T>,
    public readonly context: UserContext,
    public readonly platform: Platform,
  ) {
    super();
  }
}
