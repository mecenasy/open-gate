import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsString } from 'class-validator';

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

  @Field(() => String, { nullable: true })
  billingUserId?: string | null;
}

@ObjectType()
export class TenantStaffMembershipType {
  @Field()
  tenantId!: string;

  @Field()
  tenantSlug!: string;

  @Field()
  role!: string;
}

@ObjectType()
export class TenantStaffEntryType {
  @Field()
  tenantId!: string;

  @Field()
  userId!: string;

  @Field()
  role!: string;
}

@InputType()
export class AddTenantStaffInput {
  @Field()
  tenantId!: string;

  @Field()
  userId!: string;

  @Field()
  role!: string;
}

@InputType()
export class RemoveTenantStaffInput {
  @Field()
  tenantId!: string;

  @Field()
  userId!: string;
}

@InputType()
export class ChangeTenantStaffRoleInput {
  @Field()
  tenantId!: string;

  @Field()
  userId!: string;

  @Field()
  role!: string;
}

@ObjectType()
export class ContactType {
  @Field()
  id!: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  surname?: string;

  @Field({ nullable: true })
  accessLevel?: string;
}

@InputType()
export class AddContactInput {
  @Field()
  tenantId!: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  surname?: string;

  @Field()
  accessLevel!: string;
}

@InputType()
export class UpdateContactInput {
  @Field()
  contactId!: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  surname?: string;
}

@InputType()
export class RemoveContactFromTenantInput {
  @Field()
  tenantId!: string;

  @Field()
  contactId!: string;
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

// ─── Tenant platform credentials ──────────────────────────────────────────────

@ObjectType()
export class TenantPlatformCredentialType {
  @Field()
  platform!: string;

  @Field()
  configJson!: string;

  @Field()
  isDefault!: boolean;
}

@InputType()
export class UpdateMyPlatformCredentialsInput {
  @Field()
  platform!: string;

  @Field()
  configJson!: string;
}

// ─── Tenant features update ───────────────────────────────────────────────────

@InputType()
export class UpdateTenantFeaturesInput {
  @Field({ nullable: true })
  enableSignal?: boolean;

  @Field({ nullable: true })
  enableWhatsApp?: boolean;

  @Field({ nullable: true })
  enableMessenger?: boolean;

  @Field({ nullable: true })
  enableGate?: boolean;

  @Field({ nullable: true })
  enablePayment?: boolean;

  @Field({ nullable: true })
  enableCommandScheduling?: boolean;

  @Field({ nullable: true })
  enableAnalytics?: boolean;

  @Field({ nullable: true })
  enableAudioRecognition?: boolean;
}

// ─── Tenant command config ────────────────────────────────────────────────────

@ObjectType()
export class TenantCommandConfigType {
  @Field()
  id!: string;

  @Field()
  commandName!: string;

  @Field()
  active!: boolean;

  @Field({ nullable: true })
  parametersOverrideJson?: string;

  @Field(() => [String], { nullable: true })
  userTypes?: string[];

  @Field({ nullable: true })
  actionsJson?: string;

  @Field({ nullable: true })
  descriptionI18nJson?: string;
}

@InputType()
export class UpsertTenantCommandConfigInput {
  @Field()
  commandName!: string;

  @Field()
  active!: boolean;

  @Field({ nullable: true })
  parametersOverrideJson?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  userTypes?: string[];

  @Field({ nullable: true })
  actionsJson?: string;

  @Field({ nullable: true })
  descriptionI18nJson?: string;
}

@InputType()
export class DeleteTenantCommandConfigInput {
  @Field()
  commandName!: string;
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
  descriptionI18nJson?: string;

  @Field()
  prompt!: string;
}

@InputType()
export class UpsertTenantPromptOverrideInput {
  /** Empty string or omitted = general context (not command-specific) */
  @Field({ nullable: true })
  commandId?: string;

  @Field()
  userType!: string;

  @Field({ nullable: true })
  descriptionI18nJson?: string;

  @Field()
  prompt!: string;
}
