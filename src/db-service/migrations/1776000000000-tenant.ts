import { MigrationInterface, QueryRunner } from 'typeorm';

export class Tenant1776000000000 implements MigrationInterface {
  name = 'Tenant1776000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "shared_config"`);

    await queryRunner.query(
      `CREATE TABLE "shared_config"."tenants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying(100) NOT NULL,
        "schema_name" character varying(100) NOT NULL,
        "customization_id" uuid,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        CONSTRAINT "UQ_shared_config_tenants_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_shared_config_tenants" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "shared_config"."customization_config" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "config" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        CONSTRAINT "PK_shared_config_customization_config" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_shared_config_tenants_slug" ON "shared_config"."tenants" ("slug")`);

    await queryRunner.query(
      `CREATE INDEX "IDX_shared_config_customization_tenant_id" ON "shared_config"."customization_config" ("tenant_id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "shared_config"."customization_config"
        ADD CONSTRAINT "FK_shared_config_customization_tenant"
        FOREIGN KEY ("tenant_id") REFERENCES "shared_config"."tenants"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Default tenant — maps to existing public schema data
    await queryRunner.query(
      `INSERT INTO "shared_config"."tenants" ("slug", "schema_name", "is_active")
       VALUES ('default', 'public', true)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_config"."customization_config" DROP CONSTRAINT "FK_shared_config_customization_tenant"`,
    );
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_shared_config_customization_tenant_id"`);
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_shared_config_tenants_slug"`);
    await queryRunner.query(`DROP TABLE "shared_config"."customization_config"`);
    await queryRunner.query(`DROP TABLE "shared_config"."tenants"`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS "shared_config"`);
  }
}
