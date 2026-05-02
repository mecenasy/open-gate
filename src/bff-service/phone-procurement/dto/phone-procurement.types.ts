import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PhoneCapabilitiesType {
  @Field()
  sms!: boolean;

  @Field()
  mms!: boolean;

  @Field()
  voice!: boolean;
}

@ObjectType()
export class AvailablePhoneNumberType {
  @Field()
  phoneE164!: string;

  @Field(() => PhoneCapabilitiesType)
  capabilities!: PhoneCapabilitiesType;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  locality?: string;
}

@ObjectType()
export class PendingPhonePurchaseType {
  @Field()
  id!: string;

  @Field()
  ownerUserId!: string;

  @Field()
  providerKey!: string;

  @Field()
  phoneE164!: string;

  /** Empty until attachPhoneToTenant succeeds. */
  @Field({ nullable: true })
  attachedToTenantId?: string;

  @Field()
  purchasedAt!: string;

  @Field({ nullable: true })
  attachedAt?: string;
}

@ObjectType()
export class TenantPhoneNumberType {
  @Field()
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  phoneE164!: string;

  @Field()
  providerKey!: string;

  /** 'managed' | 'self'. */
  @Field()
  provisionedBy!: string;

  @Field(() => Int)
  monthlyMessageCount!: number;

  @Field({ nullable: true })
  lastSyncedAt?: string;

  @Field()
  purchasedAt!: string;
}

@ObjectType()
export class PhoneProcurementInfoType {
  @Field()
  providerKey!: string;

  /** True when the active provider is the mock sandbox — frontend shows a banner. */
  @Field()
  isSandbox!: boolean;
}

@InputType()
export class ListAvailablePhoneNumbersInput {
  /** ISO 3166-1 alpha-2 country code: 'PL', 'DE', 'US', ... */
  @Field()
  country!: string;

  /** 'mobile' | 'local' | 'tollfree'. Defaults to 'mobile' when omitted. */
  @Field({ nullable: true })
  type?: string;

  @Field(() => Int, { nullable: true })
  limit?: number;
}

@InputType()
export class PurchasePhoneNumberInput {
  @Field()
  country!: string;

  @Field()
  phoneE164!: string;
}

@InputType()
export class AttachPhoneToTenantInput {
  @Field()
  pendingId!: string;

  @Field()
  tenantId!: string;
}
