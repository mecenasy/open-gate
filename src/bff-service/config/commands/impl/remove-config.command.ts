import { Command } from '@nestjs/cqrs';
import { ConfigResponse } from 'src/proto/config';

export class RemoveConfigCommand extends Command<ConfigResponse> {
  constructor(public readonly key: string) {
    super();
  }
}
