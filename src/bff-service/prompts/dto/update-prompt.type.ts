import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { UserType } from './enums';

@InputType()
export class UpdatePromptType {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  key?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  commandName?: string;

  @Field(() => UserType, { nullable: true })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  prompt?: string;
}
