import { Field, InputType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { UserType } from './enums';

@InputType()
export class GetPromptType {
  @Field(() => UserType)
  @IsEnum(UserType)
  userType!: UserType;
}
