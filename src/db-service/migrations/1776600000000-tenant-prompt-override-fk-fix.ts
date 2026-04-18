import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantPromptOverrideFkFix1776600000000 implements MigrationInterface {
  name = 'TenantPromptOverrideFkFix1776600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old FK that pointed to public.commands(id) — no longer valid
    // since tenant_command_config was refactored to use commandName (text)
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_prompt_override"
        DROP CONSTRAINT IF EXISTS "FK_tenant_prompt_override_command"
    `);

    // Add new FK pointing to tenant_command_config(id)
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_prompt_override"
        ADD CONSTRAINT "FK_tenant_prompt_override_command_config"
        FOREIGN KEY ("command_id") REFERENCES "shared_config"."tenant_command_config"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_prompt_override"
        DROP CONSTRAINT IF EXISTS "FK_tenant_prompt_override_command_config"
    `);

    await queryRunner.query(`
      ALTER TABLE "shared_config"."tenant_prompt_override"
        ADD CONSTRAINT "FK_tenant_prompt_override_command"
        FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }
}
