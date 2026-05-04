import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ContactBindingType {
  @Field()
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  userId!: string;

  @Field()
  phoneE164!: string;

  /** Token text to display under the invite — useful for copy-paste fallback. */
  @Field()
  token!: string;

  /** 'signal' | 'whatsapp' | 'messenger'. */
  @Field()
  platform!: string;

  /** 'pending' | 'verified' | 'expired' | 'revoked'. */
  @Field()
  status!: string;

  /** 'operator_frontend' | 'household_invite'. */
  @Field()
  source!: string;

  /** 'pending' | 'sent' | 'failed' | 'not_on_platform'. */
  @Field()
  sendStatus!: string;

  @Field({ nullable: true })
  sendError?: string;

  @Field()
  expiresAt!: string;

  @Field({ nullable: true })
  verifiedAt?: string;

  @Field()
  createdAt!: string;
}

@InputType()
export class RequestOperatorBindingInput {
  @Field()
  tenantId!: string;

  /** E.164 phone of the person being invited. */
  @Field()
  phoneE164!: string;

  /** Required when no existing user with this phone. */
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;
}

@InputType()
export class RequestHouseholdBindingInput {
  /** E.164 phone of the household member being added. */
  @Field()
  phoneE164!: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;
}
