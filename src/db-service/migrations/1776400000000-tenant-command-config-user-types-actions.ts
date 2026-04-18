import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantCommandConfigUserTypesActions1776400000000 implements MigrationInterface {
  name = 'TenantCommandConfigUserTypesActions1776400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        ADD COLUMN IF NOT EXISTS "user_types" jsonb NOT NULL DEFAULT '[]'
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        ADD COLUMN IF NOT EXISTS "actions" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        DROP COLUMN IF EXISTS "actions"
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_command_config"
        DROP COLUMN IF EXISTS "user_types"
    `);
  }
}
