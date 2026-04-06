import { Field, InputType } from '@nestjs/graphql';
import { IsUUID, IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

@InputType()
export class ResetPasswordType {
  @Field()
  @IsUUID()
  token: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character',
  })
  password: string;
}
