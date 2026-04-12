import { Platform } from 'src/notify-service/types/platform';

export abstract class VerificationCodePlatform {
  abstract platform: Platform;
  abstract send(recipient: { phoneNumber?: string; email?: string }, code: number): Promise<void>;
}
