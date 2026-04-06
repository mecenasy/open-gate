import { IsEmail, IsString, IsUrl } from 'class-validator';

export class SendResetTokenDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsUrl()
  url: string;
}
