import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Audit trail for subscription plan changes (Phase 2 of plan-tenant-config-and-billing).
 *
 *   - shared_config.subscription_changes — append-only log of every plan
 *     selection / cancellation, capturing old/new plan, kind (initial,
 *     upgrade, downgrade, cancel) and any quota violations that were
 *     reported at the time (informational; the mutation is rejected before
 *     a downgrade with violations is persisted).
 */
export class SubscriptionChanges1777200000000 implements MigrationInterface {
  name = 'SubscriptionChanges1777200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "shared_config"."subscription_change_kind" AS ENUM('initial', 'upgrade', 'downgrade', 'cancel')`,
    );

    await queryRunner.query(
      `CREATE TABLE "shared_config"."subscription_changes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "old_plan_id" uuid,
        "new_plan_id" uuid,
        "kind" "shared_config"."subscription_change_kind" NOT NULL,
        "violations_json" jsonb,
        "correlation_id" varchar(64),
        "initiated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscription_changes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_subscription_changes_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_subscription_changes_old_plan" FOREIGN KEY ("old_plan_id") REFERENCES "shared_config"."subscription_plans"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_subscription_changes_new_plan" FOREIGN KEY ("new_plan_id") REFERENCES "shared_config"."subscription_plans"("id") ON DELETE SET NULL
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_subscription_changes_user_initiated"
         ON "shared_config"."subscription_changes" ("user_id", "initiated_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_subscription_changes_user_initiated"`);
    await queryRunner.query(`DROP TABLE "shared_config"."subscription_changes"`);
    await queryRunner.query(`DROP TYPE "shared_config"."subscription_change_kind"`);
  }
}
