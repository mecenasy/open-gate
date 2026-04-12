import { Platform } from 'src/notify-service/types/platform';

export class SendVerificationCodeCommand {
  constructor(
    public readonly platforms: Platform[],
    public readonly code: number,
    public readonly phoneNumber?: string,
    public readonly email?: string,
  ) {}
}
