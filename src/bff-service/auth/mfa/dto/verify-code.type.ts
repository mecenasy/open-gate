import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNumber, IsNotEmpty } from 'class-validator';

@InputType()
export class VerifyCodeType {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNumber()
  @IsNotEmpty()
  code: number;
}
