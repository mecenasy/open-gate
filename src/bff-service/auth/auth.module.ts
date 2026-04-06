import { Module } from '@nestjs/common';
import { MfaModule } from './mfa/mfa.module';
import { LoginModule } from './login/login.module';
import { OtpModule } from './otp/otp.module';
import { TfaModule } from './tfa/tfa.module';
import { PasskeyModule } from './passkey/passkey.module';
import { QrCodeModule } from './gr-code/qr-code.module';

@Module({
  imports: [MfaModule, OtpModule, TfaModule, LoginModule, PasskeyModule, QrCodeModule],
})
export class AuthModule {}
