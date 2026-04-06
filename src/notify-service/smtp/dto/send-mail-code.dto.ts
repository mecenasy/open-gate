import { IsEmail, IsNumber } from 'class-validator';

export class SendMailCodeDto {
  @IsEmail()
  email: string;

  @IsNumber()
  code: number;
}
