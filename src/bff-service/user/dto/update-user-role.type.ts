import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { UserRole } from './enums';

@InputType()
export class UpdateUserRoleType {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @Field(() => UserRole)
  @IsEnum(UserRole)
  type!: UserRole;
}
