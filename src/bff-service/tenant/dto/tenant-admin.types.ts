import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class CreateTenantInput {
  @Field()
  slug!: string;
}

@InputType()
export class UpdateCustomizationInput {
  @Field()
  tenantId!: string;

  /** Serialized JSON patch — only provided keys are updated */
  @Field()
  customizationJson!: string;
}

@InputType()
export class UpsertPlatformCredentialsInput {
  @Field()
  tenantId!: string;

  @Field()
  platform!: string;

  /** Serialized JSON credentials object (platform-specific shape) */
  @Field()
  configJson!: string;
}

@ObjectType()
export class TenantType {
  @Field()
  id!: string;

  @Field()
  slug!: string;

  @Field()
  schemaName!: string;

  @Field()
  isActive!: boolean;
}

@ObjectType()
export class CreateTenantResult {
  @Field()
  id!: string;

  @Field()
  slug!: string;

  @Field()
  schemaName!: string;
}

@ObjectType()
export class MutationResult {
  @Field()
  status!: boolean;

  @Field()
  message!: string;
}

// ─── Tenant command config ────────────────────────────────────────────────────

@ObjectType()
export class TenantCommandConfigType {
  @Field()
  id!: string;

  @Field()
  commandId!: string;

  @Field()
  commandName!: string;

  @Field()
  active!: boolean;

  @Field({ nullable: true })
  parametersOverrideJson?: string;
}

@InputType()
export class UpsertTenantCommandConfigInput {
  @Field()
  tenantId!: string;

  @Field()
  commandId!: string;

  @Field()
  active!: boolean;

  @Field({ nullable: true })
  parametersOverrideJson?: string;
}

// ─── Tenant prompt overrides ──────────────────────────────────────────────────

@ObjectType()
export class TenantPromptOverrideType {
  @Field()
  id!: string;

  @Field()
  tenantId!: string;

  @Field({ nullable: true })
  commandId?: string;

  @Field()
  userType!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  prompt!: string;
}

@InputType()
export class UpsertTenantPromptOverrideInput {
  @Field()
  tenantId!: string;

  /** Empty string or omitted = general context (not command-specific) */
  @Field({ nullable: true })
  commandId?: string;

  @Field()
  userType!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  prompt!: string;
}
