import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantCommandPrompt1776100000000 implements MigrationInterface {
  name = 'TenantCommandPrompt1776100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tenant_command_config table
    await queryRunner.query(`
      CREATE TABLE "shared_config"."tenant_command_config" (
        "id"                   uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id"            uuid        NOT NULL,
        "command_id"           uuid        NOT NULL,
        "active"               boolean     NOT NULL DEFAULT true,
        "parameters_override"  jsonb,
        "created_at"           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at"           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenant_command_config" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenant_command_config_tenant_command" UNIQUE ("tenant_id", "command_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_command_config_tenant_id"
        ON "shared_config"."tenant_command_config" ("tenant_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        ADD CONSTRAINT "FK_tenant_command_config_tenant"
        FOREIGN KEY ("tenant_id") REFERENCES "shared_config"."tenants"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        ADD CONSTRAINT "FK_tenant_command_config_command"
        FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create tenant_prompt_override table
    // Uses UNIQUE NULLS NOT DISTINCT so (tenantId, NULL commandId, userType) is unique (PostgreSQL 15+)
    // For older PostgreSQL, fall back to a partial unique index approach
    await queryRunner.query(`
      DO $$ BEGIN
        IF (SELECT current_setting('server_version_num')::int) >= 150000 THEN
          CREATE TABLE "shared_config"."tenant_prompt_override" (
            "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
            "tenant_id"   uuid        NOT NULL,
            "command_id"  uuid,
            "user_type"   "public"."prompts_usertype_enum" NOT NULL DEFAULT 'user',
            "description" text,
            "prompt"      text        NOT NULL,
            "created_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_tenant_prompt_override" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_tenant_prompt_override" UNIQUE NULLS NOT DISTINCT ("tenant_id", "command_id", "user_type")
          );
        ELSE
          CREATE TABLE "shared_config"."tenant_prompt_override" (
            "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
            "tenant_id"   uuid        NOT NULL,
            "command_id"  uuid,
            "user_type"   "public"."prompts_usertype_enum" NOT NULL DEFAULT 'user',
            "description" text,
            "prompt"      text        NOT NULL,
            "created_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_tenant_prompt_override" PRIMARY KEY ("id")
          );
          CREATE UNIQUE INDEX "UQ_tenant_prompt_override_non_null_cmd"
            ON "shared_config"."tenant_prompt_override" ("tenant_id", "command_id", "user_type")
            WHERE "command_id" IS NOT NULL;
          CREATE UNIQUE INDEX "UQ_tenant_prompt_override_null_cmd"
            ON "shared_config"."tenant_prompt_override" ("tenant_id", "user_type")
            WHERE "command_id" IS NULL;
        END IF;
      END $$
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_prompt_override_tenant_id"
        ON "shared_config"."tenant_prompt_override" ("tenant_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_prompt_override"
        ADD CONSTRAINT "FK_tenant_prompt_override_tenant"
        FOREIGN KEY ("tenant_id") REFERENCES "shared_config"."tenants"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_prompt_override"
        ADD CONSTRAINT "FK_tenant_prompt_override_command"
        FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Add platform_credentials table (from Phase 6, if not already present)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "shared_config"."platform_credentials" (
        "id"         uuid    NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id"  uuid    NOT NULL,
        "platform"   varchar NOT NULL,
        "config"     jsonb   NOT NULL,
        "is_active"  boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_platform_credentials" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_platform_credentials_tenant_platform" UNIQUE ("tenant_id", "platform")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_config"."tenant_prompt_override" DROP CONSTRAINT "FK_tenant_prompt_override_command"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_config"."tenant_prompt_override" DROP CONSTRAINT "FK_tenant_prompt_override_tenant"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "shared_config"."IDX_tenant_prompt_override_tenant_id"`);
    await queryRunner.query(`DROP TABLE "shared_config"."tenant_prompt_override"`);

    await queryRunner.query(
      `ALTER TABLE "shared_config"."tenant_command_config" DROP CONSTRAINT "FK_tenant_command_config_command"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_config"."tenant_command_config" DROP CONSTRAINT "FK_tenant_command_config_tenant"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "shared_config"."IDX_tenant_command_config_tenant_id"`);
    await queryRunner.query(`DROP TABLE "shared_config"."tenant_command_config"`);
  }
}
