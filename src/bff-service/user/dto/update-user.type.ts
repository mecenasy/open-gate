import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateUserType {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  surname?: string;
}
