import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class BrandingInput {
  @Field()
  tenantId!: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  primaryColor?: string;

  @Field({ nullable: true })
  secondaryColor?: string;

  /** 'small' | 'normal' | 'large' */
  @Field({ nullable: true })
  fontSize?: string;
}

@InputType()
export class MessagingInput {
  @Field()
  tenantId!: string;

  /** 'twilio' | 'legacy' | 'africastalking' */
  @Field({ nullable: true })
  defaultSmsProvider?: string;

  /** Subset of 'sms' | 'email' | 'signal' | 'whatsapp' | 'messenger' — at least one of sms/email required */
  @Field(() => [String], { nullable: true })
  priorityChannels?: string[];

  @Field(() => Int, { nullable: true })
  rateLimitPerMinute?: number;
}

@InputType()
export class CommandsConfigInput {
  @Field()
  tenantId!: string;

  @Field(() => Int, { nullable: true })
  timeout?: number;

  @Field(() => Int, { nullable: true })
  maxRetries?: number;

  @Field(() => Int, { nullable: true })
  processingDelay?: number;

  @Field({ nullable: true })
  customPromptLibraryEnabled?: boolean;
}

@InputType()
export class ComplianceInput {
  @Field()
  tenantId!: string;

  /** 'EU' | 'US' | 'APAC' */
  @Field({ nullable: true })
  dataResidency?: string;

  @Field({ nullable: true })
  encryptionEnabled?: boolean;

  @Field({ nullable: true })
  webhookUrl?: string;
}

@InputType()
export class TransferTenantBillingInput {
  @Field()
  tenantId!: string;

  @Field()
  newBillingUserId!: string;
}

@InputType()
export class SetTenantActiveInput {
  @Field()
  tenantId!: string;

  @Field()
  active!: boolean;
}

@InputType()
export class DeleteTenantInput {
  @Field()
  tenantId!: string;

  /** User must re-type the tenant slug to confirm; protects against typos */
  @Field()
  slugConfirmation!: string;
}

@ObjectType()
export class TenantBrandingType {
  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  primaryColor?: string;

  @Field({ nullable: true })
  secondaryColor?: string;

  @Field({ nullable: true })
  fontSize?: string;
}

@ObjectType()
export class TenantMessagingType {
  @Field()
  defaultSmsProvider!: string;

  @Field(() => [String])
  priorityChannels!: string[];

  @Field(() => Int)
  rateLimitPerMinute!: number;
}

@ObjectType()
export class TenantCommandsConfigType {
  @Field(() => Int)
  timeout!: number;

  @Field(() => Int)
  maxRetries!: number;

  @Field(() => Int)
  processingDelay!: number;

  @Field()
  customPromptLibraryEnabled!: boolean;
}

@ObjectType()
export class TenantComplianceType {
  @Field()
  dataResidency!: string;

  @Field()
  encryptionEnabled!: boolean;

  @Field({ nullable: true })
  webhookUrl?: string;
}
