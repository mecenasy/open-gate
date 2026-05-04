import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase: contact platform binding & identity model.
 *
 * Two new tables in shared_config:
 *
 * 1. platform_identities — permanent map (tenant, platform, platform_user_id)
 *    → user_id + phone. Source of truth for "who is this UUID on Signal?"
 *    Queried on every incoming Signal message to translate UUID → phone so
 *    existing user identification (by phone, in core-service message
 *    handler) keeps working unchanged.
 *
 * 2. contact_bindings — ephemeral verification flow (TTL 7 days). When an
 *    operator (frontend) or verified active user (household invite) adds
 *    someone by phone we issue a token, send the invite via Signal, and
 *    wait for a reply that quotes our outbound message OR contains the
 *    token in plaintext. On verify we upsert into platform_identities and
 *    keep the binding row for audit.
 *
 * Note: platform enum is shared across both tables (binding_platform);
 * contact_binding_* enums are scoped with the prefix to keep purpose clear.
 */
export class PlatformIdentitiesAndContactBindings1778200000000 implements MigrationInterface {
  name = 'PlatformIdentitiesAndContactBindings1778200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "shared_config"."binding_platform" AS ENUM('signal', 'whatsapp', 'messenger')`,
    );

    await queryRunner.query(
      `CREATE TABLE "shared_config"."platform_identities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "platform" "shared_config"."binding_platform" NOT NULL,
        "platform_user_id" varchar(255) NOT NULL,
        "phone_e164" varchar(20),
        "display_name" varchar(255),
        "verified_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "last_seen_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_platform_identities" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_platform_identities_tenant_platform_user"
          UNIQUE ("tenant_id", "platform", "platform_user_id"),
        CONSTRAINT "FK_platform_identities_tenant"
          FOREIGN KEY ("tenant_id") REFERENCES "shared_config"."tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_platform_identities_user"
          FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_platform_identities_tenant_phone"
        ON "shared_config"."platform_identities" ("tenant_id", "phone_e164")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_platform_identities_user_id"
        ON "shared_config"."platform_identities" ("user_id")`,
    );

    await queryRunner.query(
      `CREATE TYPE "shared_config"."contact_binding_status"
        AS ENUM('pending', 'verified', 'expired', 'revoked')`,
    );
    await queryRunner.query(
      `CREATE TYPE "shared_config"."contact_binding_source"
        AS ENUM('operator_frontend', 'household_invite')`,
    );
    await queryRunner.query(
      `CREATE TYPE "shared_config"."contact_binding_send_status"
        AS ENUM('pending', 'sent', 'failed', 'not_on_platform')`,
    );

    await queryRunner.query(
      `CREATE TABLE "shared_config"."contact_bindings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "phone_e164" varchar(20) NOT NULL,
        "token" varchar(32) NOT NULL,
        "platform" "shared_config"."binding_platform" NOT NULL,
        "status" "shared_config"."contact_binding_status" NOT NULL DEFAULT 'pending',
        "source" "shared_config"."contact_binding_source" NOT NULL,
        "outbound_message_id" varchar(64),
        "send_status" "shared_config"."contact_binding_send_status" NOT NULL DEFAULT 'pending',
        "send_error" text,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "verified_at" TIMESTAMP WITH TIME ZONE,
        "identity_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contact_bindings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_contact_bindings_token" UNIQUE ("token"),
        CONSTRAINT "FK_contact_bindings_tenant"
          FOREIGN KEY ("tenant_id") REFERENCES "shared_config"."tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_contact_bindings_user"
          FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_contact_bindings_identity"
          FOREIGN KEY ("identity_id") REFERENCES "shared_config"."platform_identities"("id") ON DELETE SET NULL
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_contact_bindings_tenant_phone_status"
        ON "shared_config"."contact_bindings" ("tenant_id", "phone_e164", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contact_bindings_user_id"
        ON "shared_config"."contact_bindings" ("user_id")`,
    );
    // Detector matches incoming quote.id against pending rows only — partial keeps it tight.
    await queryRunner.query(
      `CREATE INDEX "IDX_contact_bindings_outbound_msg_pending"
        ON "shared_config"."contact_bindings" ("outbound_message_id")
        WHERE "outbound_message_id" IS NOT NULL AND "status" = 'pending'`,
    );
    // Cron mark-expired scans only pending rows ordered by expiry.
    await queryRunner.query(
      `CREATE INDEX "IDX_contact_bindings_expires_pending"
        ON "shared_config"."contact_bindings" ("expires_at")
        WHERE "status" = 'pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_contact_bindings_expires_pending"`);
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_contact_bindings_outbound_msg_pending"`);
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_contact_bindings_user_id"`);
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_contact_bindings_tenant_phone_status"`);
    await queryRunner.query(`DROP TABLE "shared_config"."contact_bindings"`);
    await queryRunner.query(`DROP TYPE "shared_config"."contact_binding_send_status"`);
    await queryRunner.query(`DROP TYPE "shared_config"."contact_binding_source"`);
    await queryRunner.query(`DROP TYPE "shared_config"."contact_binding_status"`);

    await queryRunner.query(`DROP INDEX "shared_config"."IDX_platform_identities_user_id"`);
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_platform_identities_tenant_phone"`);
    await queryRunner.query(`DROP TABLE "shared_config"."platform_identities"`);

    await queryRunner.query(`DROP TYPE "shared_config"."binding_platform"`);
  }
}
