import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { UserRole, UserStatus } from './enums';

@ObjectType()
export class UserSummaryType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  surname!: string;

  @Field()
  email!: string;

  @Field()
  phone!: string;

  @Field(() => UserStatus)
  status!: UserStatus;

  @Field(() => UserRole)
  type!: UserRole;
}

@ObjectType()
export class UsersListType {
  @Field(() => [UserSummaryType])
  users!: UserSummaryType[];

  @Field(() => Int)
  total!: number;
}

@ObjectType()
export class SuccessResponseType {
  @Field()
  success!: boolean;
}
