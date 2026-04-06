import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserSummaryType {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  surname!: string;

  @Field()
  email!: string;

  @Field()
  phone!: string;
}

@ObjectType()
export class UsersListType {
  @Field(() => [UserSummaryType])
  users!: UserSummaryType[];
}

@ObjectType()
export class SuccessResponseType {
  @Field()
  success!: boolean;
}
