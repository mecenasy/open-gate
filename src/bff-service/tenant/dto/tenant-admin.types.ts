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
