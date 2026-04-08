import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class GetAllByPermissionType {
  @Field()
  @IsString()
  @IsNotEmpty()
  roleName!: string;

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
}
