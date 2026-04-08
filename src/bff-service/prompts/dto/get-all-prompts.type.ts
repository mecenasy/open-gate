import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { UserType } from './enums';

@InputType()
export class GetAllPromptsType {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page!: number;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  limit!: number;

  @Field(() => UserType, { nullable: true })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;
}
