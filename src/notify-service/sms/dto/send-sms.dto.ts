import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendSmsDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNumber()
  code: number;
}
