import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantPromptOverrideDescriptionI18n1776700000000 implements MigrationInterface {
  name = 'TenantPromptOverrideDescriptionI18n1776700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_prompt_override"
        ADD COLUMN "description_i18n" jsonb NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_prompt_override"
        DROP COLUMN IF EXISTS "description"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_prompt_override"
        ADD COLUMN "description" text NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_prompt_override"
        DROP COLUMN IF EXISTS "description_i18n"
    `);
  }
}
