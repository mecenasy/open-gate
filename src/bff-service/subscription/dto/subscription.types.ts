import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SubscriptionPlanType {
  @Field()
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  maxTenants!: number;

  @Field(() => Int)
  maxPlatformsPerTenant!: number;

  @Field(() => Int)
  maxContactsPerTenant!: number;

  @Field(() => Int)
  maxStaffPerTenant!: number;

  @Field(() => Int)
  maxCustomCommandsPerTenant!: number;

  @Field(() => Int)
  priceCents!: number;

  @Field()
  currency!: string;

  @Field()
  isActive!: boolean;
}

@ObjectType()
export class UserSubscriptionType {
  @Field()
  id!: string;

  @Field()
  planId!: string;

  @Field()
  status!: string;

  @Field()
  startedAt!: string;

  @Field({ nullable: true })
  expiresAt?: string;

  @Field(() => SubscriptionPlanType)
  plan!: SubscriptionPlanType;
}

@InputType()
export class SelectSubscriptionInput {
  @Field()
  planId!: string;
}
