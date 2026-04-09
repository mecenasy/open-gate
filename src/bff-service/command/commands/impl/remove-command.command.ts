import { Command } from '@nestjs/cqrs';
import { CommandResponse } from 'src/proto/command';

export class RemoveCommandCommand extends Command<CommandResponse> {
  constructor(public readonly id: string) {
    super();
  }
}
