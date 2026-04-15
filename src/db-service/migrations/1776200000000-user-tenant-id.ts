import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserTenantId1776200000000 implements MigrationInterface {
  name = 'UserTenantId1776200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "public"."users"
        ADD COLUMN "tenant_id" uuid NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_tenant_id"
        ON "public"."users" ("tenant_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "public"."users"
        ADD CONSTRAINT "FK_users_tenant_id"
        FOREIGN KEY ("tenant_id") REFERENCES "shared_config"."tenants"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."users" DROP CONSTRAINT "FK_users_tenant_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_tenant_id"`);
    await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "tenant_id"`);
  }
}
