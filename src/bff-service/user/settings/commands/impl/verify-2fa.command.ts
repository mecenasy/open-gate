import { Command } from '@nestjs/cqrs';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';

export class Verify2faCommand extends Command<StatusType> {
  constructor(
    public readonly id: string,
    public readonly code: string,
  ) {
    super();
  }
}
