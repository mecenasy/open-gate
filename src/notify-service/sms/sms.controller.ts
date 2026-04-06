import { Body, Controller, Post } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SendSmsDto } from './dto/send-sms.dto';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  async send(@Body() dto: SendSmsDto): Promise<void> {
    await this.smsService.sendCode(dto.phoneNumber, dto.code);
  }
}
