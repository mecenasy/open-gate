import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { UserType } from './enums';

@InputType()
export class AddPromptType {
  @Field(() => UserType)
  @IsEnum(UserType)
  userType!: UserType;

  @Field()
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  key!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  commandName!: string;
}
