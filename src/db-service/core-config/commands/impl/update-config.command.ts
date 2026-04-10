import { Command } from '@nestjs/cqrs';
import { Config as ConfigProto } from 'src/proto/config';

export class UpdateConfigCommand extends Command<ConfigProto> {
  constructor(
    public readonly key: string,
    public readonly value: string,
  ) {
    super();
  }
}
