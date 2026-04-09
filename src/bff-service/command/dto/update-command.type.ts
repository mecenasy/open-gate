import { Field, ID, InputType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdateCommandType {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @Field(() => GraphQLJSON)
  actions!: Record<string, boolean>;

  @Field(() => GraphQLJSON)
  parameters!: Record<string, boolean>;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  roleNames!: string[];
}
