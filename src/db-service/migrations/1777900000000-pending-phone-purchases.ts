import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Holds phone numbers purchased on the master account that haven't been
 * attached to a tenant yet (e.g. user purchased a number in the wizard
 * but didn't finish creating the tenant).
 *
 * The hourly cleanup cron releases rows where attached_to_tenant_id IS NULL
 * and purchased_at is older than the safety window — protects budget from
 * abandoned wizards.
 *
 * Once attached, the row stays for audit (links the purchase event to the
 * resulting tenant) and is no longer eligible for release.
 */
export class PendingPhonePurchases1777900000000 implements MigrationInterface {
  name = 'PendingPhonePurchases1777900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "shared_config"."pending_phone_purchases" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_user_id" uuid NOT NULL,
        "provider_key" varchar(40) NOT NULL,
        "provider_external_id" varchar(100) NOT NULL,
        "phone_e164" varchar(20) NOT NULL,
        "attached_to_tenant_id" uuid,
        "purchased_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "attached_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pending_phone_purchases" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_pending_phone_purchases_provider_external"
          UNIQUE ("provider_key", "provider_external_id"),
        CONSTRAINT "FK_pending_phone_purchases_owner"
          FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_pending_phone_purchases_tenant"
          FOREIGN KEY ("attached_to_tenant_id") REFERENCES "shared_config"."tenants"("id")
          ON DELETE SET NULL
      )`,
    );

    // The cleanup cron scans only unattached rows ordered by purchased_at,
    // so a partial index keeps it cheap as the table grows with attached
    // (= terminal) rows over time.
    await queryRunner.query(
      `CREATE INDEX "IDX_pending_phone_purchases_unattached"
        ON "shared_config"."pending_phone_purchases" ("purchased_at")
        WHERE "attached_to_tenant_id" IS NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_pending_phone_purchases_owner"
        ON "shared_config"."pending_phone_purchases" ("owner_user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_pending_phone_purchases_owner"`);
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_pending_phone_purchases_unattached"`);
    await queryRunner.query(`DROP TABLE "shared_config"."pending_phone_purchases"`);
  }
}
