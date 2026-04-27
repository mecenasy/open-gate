import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds phone-procurement limits to subscription plans:
 *   - phone_numbers_included        — how many phone numbers the plan covers (0 disables managed flow)
 *   - messages_per_month_included   — SMS quota covered by the subscription before overage
 *   - price_per_extra_message_cents — our markup per SMS over the included quota
 *   - phone_monthly_cost_cents      — informational, what the number costs us per month
 *
 * Default seed values are placeholders (overage prices = 0). Ops must set
 * real overage rates before exposing the managed flow to paid tenants.
 */
export class SubscriptionPlansPhoneLimits1777600000000 implements MigrationInterface {
  name = 'SubscriptionPlansPhoneLimits1777600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_config"."subscription_plans"
        ADD COLUMN "phone_numbers_included" integer NOT NULL DEFAULT 0,
        ADD COLUMN "messages_per_month_included" integer NOT NULL DEFAULT 0,
        ADD COLUMN "price_per_extra_message_cents" integer NOT NULL DEFAULT 0,
        ADD COLUMN "phone_monthly_cost_cents" integer NOT NULL DEFAULT 0`,
    );

    // Re-seed the four shipped plans. minimal gets no phone (disables managed flow),
    // standard/pro/full get one phone each with growing SMS quotas.
    await queryRunner.query(
      `UPDATE "shared_config"."subscription_plans"
       SET "phone_numbers_included" = CASE "code"
             WHEN 'minimal'  THEN 0
             WHEN 'standard' THEN 1
             WHEN 'pro'      THEN 1
             WHEN 'full'     THEN 1
             ELSE 0
           END,
           "messages_per_month_included" = CASE "code"
             WHEN 'minimal'  THEN 0
             WHEN 'standard' THEN 500
             WHEN 'pro'      THEN 2000
             WHEN 'full'     THEN 10000
             ELSE 0
           END
       WHERE "code" IN ('minimal','standard','pro','full')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_config"."subscription_plans"
        DROP COLUMN "phone_monthly_cost_cents",
        DROP COLUMN "price_per_extra_message_cents",
        DROP COLUMN "messages_per_month_included",
        DROP COLUMN "phone_numbers_included"`,
    );
  }
}
