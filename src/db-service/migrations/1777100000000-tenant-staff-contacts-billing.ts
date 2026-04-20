import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 4: introduce multi-tenant ownership model.
 *   - tenant_staff (M:N users ↔ tenants with role OWNER/ADMIN/SUPPORT)
 *   - contacts + contact_memberships (non-login recipients of communication)
 *   - tenants.billing_user_id (which user's subscription pays for the tenant)
 *   - backfill: existing owners → tenant_staff OWNER + billing_user_id
 *   - drop users.tenant_id (staff membership now lives in tenant_staff)
 */
export class TenantStaffContactsBilling1777100000000 implements MigrationInterface {
  name = 'TenantStaffContactsBilling1777100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "shared_config"."tenant_staff_role" AS ENUM('owner', 'admin', 'support')`);

    await queryRunner.query(
      `CREATE TABLE "shared_config"."tenant_staff" (
        "tenant_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" "shared_config"."tenant_staff_role" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenant_staff" PRIMARY KEY ("tenant_id", "user_id"),
        CONSTRAINT "FK_tenant_staff_tenant" FOREIGN KEY ("tenant_id") REFERENCES "shared_config"."tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tenant_staff_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_tenant_staff_user_id" ON "shared_config"."tenant_staff" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_tenant_staff_role" ON "shared_config"."tenant_staff" ("role")`);

    await queryRunner.query(`CREATE TYPE "shared_config"."contact_access_level" AS ENUM('primary', 'secondary')`);

    await queryRunner.query(
      `CREATE TABLE "shared_config"."contacts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar(120),
        "phone" varchar(20),
        "name" varchar(120) NOT NULL,
        "surname" varchar(120),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contacts" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_contacts_email" ON "shared_config"."contacts" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_contacts_phone" ON "shared_config"."contacts" ("phone")`);

    await queryRunner.query(
      `CREATE TABLE "shared_config"."contact_memberships" (
        "contact_id" uuid NOT NULL,
        "tenant_id" uuid NOT NULL,
        "access_level" "shared_config"."contact_access_level" NOT NULL DEFAULT 'primary',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contact_memberships" PRIMARY KEY ("contact_id", "tenant_id"),
        CONSTRAINT "FK_contact_memberships_contact" FOREIGN KEY ("contact_id") REFERENCES "shared_config"."contacts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_contact_memberships_tenant" FOREIGN KEY ("tenant_id") REFERENCES "shared_config"."tenants"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contact_memberships_tenant_id" ON "shared_config"."contact_memberships" ("tenant_id")`,
    );

    await queryRunner.query(`ALTER TABLE "shared_config"."tenants" ADD COLUMN "billing_user_id" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_tenants_billing_user_id" ON "shared_config"."tenants" ("billing_user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_config"."tenants"
         ADD CONSTRAINT "FK_tenants_billing_user"
         FOREIGN KEY ("billing_user_id") REFERENCES "public"."users"("id")
         ON DELETE SET NULL`,
    );

    // Backfill: for every tenant, find a user currently attached via users.tenant_id
    // whose user_role is 'owner' — promote them to tenant_staff OWNER + billing_user_id.
    await queryRunner.query(
      `INSERT INTO "shared_config"."tenant_staff" ("tenant_id", "user_id", "role")
       SELECT u."tenant_id", u."id", 'owner'
       FROM "public"."users" u
       JOIN "public"."user_roles" r ON r."id" = u."userRoleId"
       WHERE u."tenant_id" IS NOT NULL AND r."userType" = 'owner'
       ON CONFLICT DO NOTHING`,
    );

    await queryRunner.query(
      `UPDATE "shared_config"."tenants" t
         SET "billing_user_id" = sub.user_id
       FROM (
         SELECT DISTINCT ON (u."tenant_id") u."tenant_id" AS tenant_id, u."id" AS user_id
         FROM "public"."users" u
         JOIN "public"."user_roles" r ON r."id" = u."userRoleId"
         WHERE u."tenant_id" IS NOT NULL AND r."userType" = 'owner'
         ORDER BY u."tenant_id", u."created_at" ASC
       ) sub
       WHERE t."id" = sub.tenant_id AND t."billing_user_id" IS NULL`,
    );

    // Now drop users.tenant_id — membership lives in tenant_staff.
    await queryRunner.query(`ALTER TABLE "public"."users" DROP CONSTRAINT IF EXISTS "FK_users_tenant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_users_tenant_id"`);
    await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "tenant_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."users" ADD COLUMN "tenant_id" uuid`);
    await queryRunner.query(`CREATE INDEX "IDX_users_tenant_id" ON "public"."users" ("tenant_id")`);
    await queryRunner.query(
      `ALTER TABLE "public"."users"
         ADD CONSTRAINT "FK_users_tenant_id"
         FOREIGN KEY ("tenant_id") REFERENCES "shared_config"."tenants"("id")
         ON DELETE SET NULL`,
    );

    await queryRunner.query(`ALTER TABLE "shared_config"."tenants" DROP CONSTRAINT "FK_tenants_billing_user"`);
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_tenants_billing_user_id"`);
    await queryRunner.query(`ALTER TABLE "shared_config"."tenants" DROP COLUMN "billing_user_id"`);

    await queryRunner.query(`DROP INDEX "shared_config"."IDX_contact_memberships_tenant_id"`);
    await queryRunner.query(`DROP TABLE "shared_config"."contact_memberships"`);
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_contacts_phone"`);
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_contacts_email"`);
    await queryRunner.query(`DROP TABLE "shared_config"."contacts"`);
    await queryRunner.query(`DROP TYPE "shared_config"."contact_access_level"`);

    await queryRunner.query(`DROP INDEX "shared_config"."IDX_tenant_staff_role"`);
    await queryRunner.query(`DROP INDEX "shared_config"."IDX_tenant_staff_user_id"`);
    await queryRunner.query(`DROP TABLE "shared_config"."tenant_staff"`);
    await queryRunner.query(`DROP TYPE "shared_config"."tenant_staff_role"`);
  }
}
