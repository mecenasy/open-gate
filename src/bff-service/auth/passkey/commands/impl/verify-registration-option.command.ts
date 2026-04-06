import { Command } from '@nestjs/cqrs';
import { RegistrationResponseJSON } from '@simplewebauthn/server';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';

export class VerifyRegistrationOptionCommand extends Command<StatusType> {
  constructor(
    public readonly userId: string,
    public readonly option: RegistrationResponseJSON,
    public readonly ua: string,
  ) {
    super();
  }
}
