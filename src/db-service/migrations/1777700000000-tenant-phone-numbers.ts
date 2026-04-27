import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phone numbers procured for tenants — records the master-account purchase
 * + the tenant it ended up attached to. Provider-agnostic by design:
 * provider_key + provider_external_id can point at Twilio, mock (sandbox),
 * or any future SMS operator without schema changes.
 *
 * Uniqueness:
 *   - (provider_key, provider_external_id) is globally unique — provider's
 *     own ID space.
 *   - phone_e164 is unique only for non-mock rows: in sandbox every tenant
 *     shares one physical test number, so each row gets its own external_id
 *     but the phone string repeats.
 */
export class TenantPhoneNumbers1777700000000 implements MigrationInterface {
  name = 'TenantPhoneNumbers1777700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "shared_config"."tenant_phone_numbers_provisioned_by_enum"
        AS ENUM('managed', 'self')`,
    );

    await queryRunner.query(
      `CREATE TABLE "shared_config"."tenant_phone_numbers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "phone_e164" varchar(20) NOT NULL,
        "provider_key" varchar(40) NOT NULL,
        "provider_external_id" varchar(100) NOT NULL,
        "provisioned_by" "shared_config"."tenant_phone_numbers_provisioned_by_enum" NOT NULL,
        "monthly_message_count" integer NOT NULL DEFAULT 0,
        "last_synced_at" TIMESTAMP WITH TIME ZONE,
        "purchased_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenant_phone_numbers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenant_phone_numbers_provider_external"
          UNIQUE ("provider_key", "provider_external_id"),
        CONSTRAINT "FK_tenant_phone_numbers_tenant"
          FOREIGN KEY ("tenant_id") REFERENCES "shared_config"."tenants"("id")
          ON DELETE CASCADE
      )`,
    );

    // Partial unique on phone — sandbox tenants legitimately share one
    // physical test number, but real numbers must be unique per tenant.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_tenant_phone_numbers_phone_e164_real"
        ON "shared_config"."tenant_phone_numbers" ("phone_e164")
        WHERE "provider_key" <> 'mock'`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_tenant_phone_numbers_tenant_id"
        ON "shared_config"."tenant_phone_numbers" ("tenant_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_tenant_phone_numbers_tenant_id"`);
    await queryRunner.query(`DROP INDEX "shared_config"."UQ_tenant_phone_numbers_phone_e164_real"`);
    await queryRunner.query(`DROP TABLE "shared_config"."tenant_phone_numbers"`);
    await queryRunner.query(`DROP TYPE "shared_config"."tenant_phone_numbers_provisioned_by_enum"`);
  }
}
