import { Field, ID, InputType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CommandAction } from './enums';

@InputType()
export class UpdateCommandType {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @Field(() => [CommandAction], { defaultValue: [] })
  @IsArray()
  @IsEnum(CommandAction, { each: true })
  actions!: CommandAction[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  parameters?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  roleNames!: string[];
}
