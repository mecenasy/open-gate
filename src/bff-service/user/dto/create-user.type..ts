import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

@InputType()
export class CreateUserType {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character',
  })
  password!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  surname!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  type!: string;
}
