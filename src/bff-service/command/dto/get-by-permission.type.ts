import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetByPermissionType {
  @Field()
  @IsString()
  @IsNotEmpty()
  roleName!: string;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  id?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;
}
