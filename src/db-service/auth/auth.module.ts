import { Module } from '@nestjs/common';
import { LoginModule } from './login/login.module';
import { PasskeyModule } from './passkey/passkey.module';

@Module({
  imports: [LoginModule, PasskeyModule],
})
export class AuthModule {}
