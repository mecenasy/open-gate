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

  /** Phone procurement: how many managed numbers the plan covers (0 disables managed flow). */
  @Field(() => Int)
  phoneNumbersIncluded!: number;

  /** Phone procurement: SMS quota covered by the subscription before overage. */
  @Field(() => Int)
  messagesPerMonthIncluded!: number;

  /** Phone procurement: cents charged per SMS sent over the quota (operator pass-through + our markup). */
  @Field(() => Int)
  pricePerExtraMessageCents!: number;

  /** Phone procurement: informational — what the number costs us per month from the operator. */
  @Field(() => Int)
  phoneMonthlyCostCents!: number;

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

@ObjectType()
export class QuotaViolationType {
  @Field()
  kind!: string;

  @Field({ nullable: true })
  tenantId?: string;

  @Field(() => Int)
  current!: number;

  @Field(() => Int)
  max!: number;
}

@ObjectType()
export class PlanChangePreviewType {
  @Field(() => SubscriptionPlanType)
  newPlan!: SubscriptionPlanType;

  @Field(() => SubscriptionPlanType, { nullable: true })
  currentPlan?: SubscriptionPlanType;

  /** 'initial' | 'upgrade' | 'downgrade' | 'same' */
  @Field()
  kind!: string;

  @Field(() => [QuotaViolationType])
  violations!: QuotaViolationType[];

  @Field(() => Int)
  deltaPriceCents!: number;
}

@ObjectType()
export class SubscriptionChangeType {
  @Field()
  id!: string;

  @Field({ nullable: true })
  oldPlanId?: string;

  @Field({ nullable: true })
  newPlanId?: string;

  @Field()
  kind!: string;

  @Field()
  initiatedAt!: string;
}
