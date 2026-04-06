import { Command } from '@nestjs/cqrs';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';

export class AcceptAdaptiveLoginCommand extends Command<StatusType> {
  constructor(public readonly id: string) {
    super();
  }
}
