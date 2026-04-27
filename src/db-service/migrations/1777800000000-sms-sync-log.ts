import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Daily idempotency log for the SMS counter sync cron. Each (tenant, date)
 * pair is recorded exactly once; the cron uses an INSERT ... ON CONFLICT
 * DO NOTHING to skip days it already processed, even if the cron fires more
 * than once per UTC day (deploys, restarts, manual re-runs).
 */
export class SmsSyncLog1777800000000 implements MigrationInterface {
  name = 'SmsSyncLog1777800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "shared_config"."sms_sync_log" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "sync_date" date NOT NULL,
        "messages_counted" integer NOT NULL DEFAULT 0,
        "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sms_sync_log" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sms_sync_log_tenant_date" UNIQUE ("tenant_id", "sync_date"),
        CONSTRAINT "FK_sms_sync_log_tenant"
          FOREIGN KEY ("tenant_id") REFERENCES "shared_config"."tenants"("id")
          ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_sms_sync_log_tenant_date"
        ON "shared_config"."sms_sync_log" ("tenant_id", "sync_date" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_sms_sync_log_tenant_date"`);
    await queryRunner.query(`DROP TABLE "shared_config"."sms_sync_log"`);
  }
}
