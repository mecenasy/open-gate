import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { CommandAction } from './enums';

@InputType()
export class GetAllCommandsType {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page!: number;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  limit!: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  activeOnly?: boolean;

  @Field(() => CommandAction, { nullable: true })
  @IsEnum(CommandAction)
  @IsOptional()
  actionFilter?: CommandAction;
}
