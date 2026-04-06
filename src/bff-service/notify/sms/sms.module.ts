import { Module } from '@nestjs/common';
import { SmsSaga } from './sms.saga';
import { SmsCodeHandler } from './commands/handler/sms-code.handler';

@Module({
  providers: [SmsSaga, SmsCodeHandler],
})
export class SmsModule {}
