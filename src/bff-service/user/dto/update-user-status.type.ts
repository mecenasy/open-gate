import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { UserStatus } from './enums';

@InputType()
export class UpdateUserStatusType {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @Field(() => UserStatus)
  @IsEnum(UserStatus)
  status!: UserStatus;
}
