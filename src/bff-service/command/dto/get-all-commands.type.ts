import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

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

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  actionFilter?: Record<string, boolean>;
}
