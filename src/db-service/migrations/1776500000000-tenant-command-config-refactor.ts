import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantCommandConfigRefactor1776500000000 implements MigrationInterface {
  name = 'TenantCommandConfigRefactor1776500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add command_name column (nullable first to allow data migration)
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        ADD COLUMN IF NOT EXISTS "command_name" text
    `);

    // 2. Populate command_name from joined commands table
    await queryRunner.query(`
      UPDATE "shared_config"."tenant_command_config" tcc
        SET command_name = c.name
        FROM "public"."commands" c
        WHERE c.id = tcc.command_id
    `);

    // 3. Fallback: rows with no matching command get empty string
    await queryRunner.query(`
      UPDATE "shared_config"."tenant_command_config"
        SET command_name = ''
        WHERE command_name IS NULL
    `);

    // 4. Make command_name NOT NULL
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        ALTER COLUMN "command_name" SET NOT NULL
    `);

    // 5. Drop FK constraint on command_id
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        DROP CONSTRAINT IF EXISTS "FK_tenant_command_config_command"
    `);

    // 6. Drop old unique constraint (tenant_id, command_id)
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        DROP CONSTRAINT IF EXISTS "UQ_tenant_command_config_tenant_command"
    `);

    // 7. Drop command_id column
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        DROP COLUMN IF EXISTS "command_id"
    `);

    // 8. Add new unique constraint (tenant_id, command_name)
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        ADD CONSTRAINT "UQ_tenant_command_config_tenant_name"
        UNIQUE ("tenant_id", "command_name")
    `);

    // 9. Add description_i18n column
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        ADD COLUMN IF NOT EXISTS "description_i18n" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        DROP COLUMN IF EXISTS "description_i18n"
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        DROP CONSTRAINT IF EXISTS "UQ_tenant_command_config_tenant_name"
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        ADD COLUMN "command_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        DROP COLUMN IF EXISTS "command_name"
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        ADD CONSTRAINT "UQ_tenant_command_config_tenant_command"
        UNIQUE ("tenant_id", "command_id")
    `);
  }
}
