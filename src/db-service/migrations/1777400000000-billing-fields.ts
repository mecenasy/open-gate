import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 8 of plan-tenant-config-and-billing — billing provider hooks.
 *
 *   - user_subscriptions gets billing-provider fields:
 *       * external_subscription_id (Stripe sub_xxx, NoopBillingProvider
 *         synthesizes a deterministic value)
 *       * cancel_at_period_end (true after a "cancel at end of billing
 *         period" mutation)
 *       * current_period_end (timestamptz; cron promotes
 *         ScheduledCancellation → Canceled when reached)
 *   - subscription status enum extended with 'scheduled_cancellation'
 *     between Active and Canceled.
 */
export class BillingFields1777400000000 implements MigrationInterface {
  name = 'BillingFields1777400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "shared_config"."user_subscriptions_status_enum"
         ADD VALUE IF NOT EXISTS 'scheduled_cancellation' BEFORE 'canceled'`,
    );

    await queryRunner.query(
      `ALTER TABLE "shared_config"."user_subscriptions"
         ADD COLUMN IF NOT EXISTS "external_subscription_id" varchar(128)`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_config"."user_subscriptions"
         ADD COLUMN IF NOT EXISTS "cancel_at_period_end" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_config"."user_subscriptions"
         ADD COLUMN IF NOT EXISTS "current_period_end" timestamptz`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_subscriptions_period_end"
         ON "shared_config"."user_subscriptions" ("current_period_end")
         WHERE "cancel_at_period_end" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "shared_config"."IDX_user_subscriptions_period_end"`);
    await queryRunner.query(
      `ALTER TABLE "shared_config"."user_subscriptions" DROP COLUMN IF EXISTS "current_period_end"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_config"."user_subscriptions" DROP COLUMN IF EXISTS "cancel_at_period_end"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_config"."user_subscriptions" DROP COLUMN IF EXISTS "external_subscription_id"`,
    );
    // Postgres doesn't support DROP VALUE on an enum — the
    // 'scheduled_cancellation' label survives; future code defends
    // against unexpected values via the SubscriptionStatus type.
  }
}
