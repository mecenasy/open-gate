import { Body, Controller, Post } from '@nestjs/common';
import { SmtpService } from './smtp.service';
import { SendMailCodeDto } from './dto/send-mail-code.dto';
import { SendResetTokenDto } from './dto/send-reset-token.dto';

@Controller('smtp')
export class SmtpController {
  constructor(private readonly smtpService: SmtpService) {}

  @Post('send-code')
  async sendCode(@Body() dto: SendMailCodeDto): Promise<void> {
    await this.smtpService.sendVerificationCode(dto.email, dto.code);
  }

  @Post('reset-token')
  async resetToken(@Body() dto: SendResetTokenDto): Promise<void> {
    await this.smtpService.sendResetToken(dto.email, dto.url);
  }
}
