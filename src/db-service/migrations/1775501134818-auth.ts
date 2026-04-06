import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auth1775501134818 implements MigrationInterface {
  name = 'Auth1775501134818';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_histories" ("id" SERIAL NOT NULL, "last_ip" character varying(40) NOT NULL, "fingerprint_hash" character varying NOT NULL, "country" character varying(2) NOT NULL, "city" character varying(100) NOT NULL, "user_agent" character varying(255) NOT NULL, "is_trusted" boolean NOT NULL DEFAULT false, "mfa_passed" boolean NOT NULL DEFAULT true, "failure_count" integer NOT NULL DEFAULT '0', "last_failure_at" TIMESTAMP WITH TIME ZONE, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "last_score" integer NOT NULL DEFAULT '0', "risk_reasons" jsonb NOT NULL DEFAULT '[]', "userId" uuid, CONSTRAINT "UQ_d39c7bd136a6c9ef9bffac192b1" UNIQUE ("fingerprint_hash"), CONSTRAINT "PK_ef1314fa983d71bb54a74ca6d40" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bb62666e9b192b50d7d7657549" ON "auth_histories" ("fingerprint_hash", "user_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_settings_risk_tolerance_level_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("is_two_factor_enabled" boolean NOT NULL DEFAULT false, "two_factor_secret" character varying(100), "is_adaptive_auth_enabled" boolean NOT NULL DEFAULT false, "risk_tolerance_level" "public"."user_settings_risk_tolerance_level_enum" NOT NULL DEFAULT 'MEDIUM', "user_id" uuid NOT NULL, CONSTRAINT "PK_4ed056b9344e6f7d8d46ec4b302" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pass-key" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "credential_id" character varying NOT NULL, "publicKey" bytea NOT NULL, "counter" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "devicename" character varying, "userId" uuid NOT NULL, CONSTRAINT "UQ_6ef3ad3e0c3ed49e0ba7d0cc057" UNIQUE ("credential_id"), CONSTRAINT "PK_cf3d69e38006176fa4189ff2622" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "password" ("userId" uuid NOT NULL, "hash" character varying(100) NOT NULL, "salt" character varying(100) NOT NULL, CONSTRAINT "PK_dc877602e08545367e6f85b02e5" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_histories" ADD CONSTRAINT "FK_9c4764eda704966a9deac6d00be" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "pass-key" ADD CONSTRAINT "FK_52db8a0e7519b88e522e0a07da5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "password" ADD CONSTRAINT "FK_dc877602e08545367e6f85b02e5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "password" DROP CONSTRAINT "FK_dc877602e08545367e6f85b02e5"`);
    await queryRunner.query(`ALTER TABLE "pass-key" DROP CONSTRAINT "FK_52db8a0e7519b88e522e0a07da5"`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302"`);
    await queryRunner.query(`ALTER TABLE "auth_histories" DROP CONSTRAINT "FK_9c4764eda704966a9deac6d00be"`);
    await queryRunner.query(`DROP TABLE "password"`);
    await queryRunner.query(`DROP TABLE "pass-key"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP TYPE "public"."user_settings_risk_tolerance_level_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bb62666e9b192b50d7d7657549"`);
    await queryRunner.query(`DROP TABLE "auth_histories"`);
  }
}
