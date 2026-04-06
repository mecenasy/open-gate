import { Module } from '@nestjs/common';
import { SmtpSaga } from './smtp.saga';
import { smtpCommands } from './commands/handler';

@Module({
  providers: [SmtpSaga, ...smtpCommands],
})
export class SmtpModule {}
