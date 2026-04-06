import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class LoginType {
  @Field()
  @IsEmail({}, { message: 'Invalid email' })
  email: string;
  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}
