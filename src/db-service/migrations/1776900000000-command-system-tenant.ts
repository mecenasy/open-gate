import { MigrationInterface, QueryRunner } from 'typeorm';

export class CommandSystemTenant1776900000000 implements MigrationInterface {
  name = 'CommandSystemTenant1776900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "commands" ADD COLUMN "is_system" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "commands" ADD COLUMN "tenant_id" uuid`);

    // Existing commands are pre-platform commands — treat them as system commands.
    await queryRunner.query(`UPDATE "commands" SET "is_system" = true WHERE "tenant_id" IS NULL`);

    await queryRunner.query(`CREATE INDEX "IDX_commands_is_system" ON "commands" ("is_system")`);
    await queryRunner.query(`CREATE INDEX "IDX_commands_tenant_id" ON "commands" ("tenant_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_commands_tenant_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_commands_is_system"`);
    await queryRunner.query(`ALTER TABLE "commands" DROP COLUMN "tenant_id"`);
    await queryRunner.query(`ALTER TABLE "commands" DROP COLUMN "is_system"`);
  }
}
