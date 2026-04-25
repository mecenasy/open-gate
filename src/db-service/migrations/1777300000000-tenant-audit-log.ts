import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Append-only log of sensitive tenant-level operations (Phase 7 of
 * plan-tenant-config-and-billing).
 *
 *   - shared_config.tenant_audit_log captures who performed what action
 *     on which tenant, with payload + correlation context. Indexed by
 *     (tenantId, createdAt DESC) for the per-tenant Audit tab and by
 *     (userId, createdAt DESC) for cross-tenant audit queries.
 */
export class TenantAuditLog1777300000000 implements MigrationInterface {
  name = 'TenantAuditLog1777300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "shared_config"."tenant_audit_log" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid,
        "user_id" uuid NOT NULL,
        "action" varchar(64) NOT NULL,
        "payload_json" jsonb,
        "ip" varchar(64),
        "user_agent" text,
        "correlation_id" varchar(64),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenant_audit_log" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tenant_audit_log_tenant" FOREIGN KEY ("tenant_id") REFERENCES "shared_config"."tenants"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tenant_audit_log_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_tenant_audit_log_tenant_created"
         ON "shared_config"."tenant_audit_log" ("tenant_id", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tenant_audit_log_user_created"
         ON "shared_config"."tenant_audit_log" ("user_id", "created_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_tenant_audit_log_user_created"`);
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_tenant_audit_log_tenant_created"`);
    await queryRunner.query(`DROP TABLE "shared_config"."tenant_audit_log"`);
  }
}
