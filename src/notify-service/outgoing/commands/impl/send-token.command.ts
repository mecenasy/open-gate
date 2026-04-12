import { Platform } from 'src/notify-service/types/platform';

export class SendTokenCommand {
  constructor(
    public readonly platforms: Platform[],
    public readonly email: string,
    public readonly url: string,
  ) {}
}
