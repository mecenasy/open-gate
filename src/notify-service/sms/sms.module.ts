import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { smsConfig } from './config/sms.configs';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';

@Module({
  imports: [ConfigModule.forFeature(smsConfig)],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
