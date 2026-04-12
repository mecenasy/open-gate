import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerificationCodePlatform } from '../../platforms/base/verification-code-platform';
import { SendVerificationCodeCommand } from '../impl/send-verification-code.command';

@CommandHandler(SendVerificationCodeCommand)
export class SendVerificationCodeHandler implements ICommandHandler<SendVerificationCodeCommand> {
  constructor(
    @Inject(VerificationCodePlatform)
    private readonly strategies: VerificationCodePlatform[],
  ) {}

  async execute({ platforms, code, phoneNumber, email }: SendVerificationCodeCommand): Promise<void> {
    for (const platform of platforms) {
      const strategy = this.strategies.find((s) => s.platform === platform);
      if (strategy) {
        await strategy.send({ phoneNumber, email }, code);
      }
    }
  }
}
