import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { UserStatus, UserRole } from './enums';

@InputType()
export class CreateSimpleUserType {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  surname!: string;

  @Field(() => UserRole, { nullable: false })
  @IsEnum(UserRole)
  @IsNotEmpty()
  type!: UserRole;

  @Field(() => UserStatus, { nullable: false })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status!: UserStatus;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phoneOwner?: string;
}
