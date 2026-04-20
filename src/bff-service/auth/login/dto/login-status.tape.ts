import { Field, ID, ObjectType } from '@nestjs/graphql';
import { StatusType } from './status.type';

@ObjectType()
export class UserStatusType {
  @Field(() => ID)
  id!: string;

  @Field()
  admin!: boolean;

  @Field()
  owner?: boolean;

  @Field()
  email!: string;

  @Field()
  is2faEnabled!: boolean;

  @Field()
  isAdaptiveLoginEnabled!: boolean;

  @Field({ nullable: true })
  tenantId?: string;
}

@ObjectType()
export class LoginStatusType extends StatusType {
  @Field({ nullable: true })
  user?: UserStatusType;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  phoneId?: string;
}
