import { MigrationInterface, QueryRunner } from 'typeorm';

export class SubscriptionPlans1776800000000 implements MigrationInterface {
  name = 'SubscriptionPlans1776800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "shared_config"."subscription_plans_code_enum" AS ENUM('minimal', 'standard', 'pro', 'full')`,
    );

    await queryRunner.query(
      `CREATE TYPE "shared_config"."user_subscriptions_status_enum" AS ENUM('active', 'canceled', 'expired')`,
    );

    await queryRunner.query(
      `CREATE TABLE "shared_config"."subscription_plans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" "shared_config"."subscription_plans_code_enum" NOT NULL,
        "name" character varying(100) NOT NULL,
        "max_tenants" integer NOT NULL,
        "max_platforms_per_tenant" integer NOT NULL,
        "max_contacts_per_tenant" integer NOT NULL,
        "max_staff_per_tenant" integer NOT NULL,
        "max_custom_commands_per_tenant" integer NOT NULL,
        "price_cents" integer NOT NULL DEFAULT 0,
        "currency" character varying(3) NOT NULL DEFAULT 'EUR',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        CONSTRAINT "UQ_shared_config_subscription_plans_code" UNIQUE ("code"),
        CONSTRAINT "PK_shared_config_subscription_plans" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "shared_config"."user_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "plan_id" uuid NOT NULL,
        "status" "shared_config"."user_subscriptions_status_enum" NOT NULL DEFAULT 'active',
        "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        CONSTRAINT "UQ_shared_config_user_subscriptions_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_shared_config_user_subscriptions" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "shared_config"."user_subscriptions"
        ADD CONSTRAINT "FK_shared_config_user_subscriptions_plan"
        FOREIGN KEY ("plan_id") REFERENCES "shared_config"."subscription_plans"("id")
        ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_shared_config_user_subscriptions_plan_id" ON "shared_config"."user_subscriptions" ("plan_id")`,
    );

    // Seed 4 plans
    await queryRunner.query(
      `INSERT INTO "shared_config"."subscription_plans"
        ("code", "name", "max_tenants", "max_platforms_per_tenant", "max_contacts_per_tenant",
         "max_staff_per_tenant", "max_custom_commands_per_tenant", "price_cents", "currency", "is_active")
       VALUES
        ('minimal',  'Minimal',  1, 1, 50,    1,  0,   0,   'EUR', true),
        ('standard', 'Standard', 1, 3, 500,   5,  10,  1900, 'EUR', true),
        ('pro',      'Pro',      3, 5, 2000,  15, 50,  4900, 'EUR', true),
        ('full',     'Full',     10, 10, 10000, 50, 200, 9900, 'EUR', true)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_shared_config_user_subscriptions_plan_id"`);
    await queryRunner.query(
      `ALTER TABLE "shared_config"."user_subscriptions" DROP CONSTRAINT "FK_shared_config_user_subscriptions_plan"`,
    );
    await queryRunner.query(`DROP TABLE "shared_config"."user_subscriptions"`);
    await queryRunner.query(`DROP TABLE "shared_config"."subscription_plans"`);
    await queryRunner.query(`DROP TYPE "shared_config"."user_subscriptions_status_enum"`);
    await queryRunner.query(`DROP TYPE "shared_config"."subscription_plans_code_enum"`);
  }
}
