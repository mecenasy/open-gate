import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1775481690733 implements MigrationInterface {
  name = 'Init1775481690733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "commands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "active" boolean NOT NULL DEFAULT true, "actions" text NOT NULL, "parameters" jsonb NOT NULL DEFAULT '{}', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_87632c6d4596995f1346b23c0ca" UNIQUE ("name"), CONSTRAINT "PK_7ac292c3aa19300482b2b190d1e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_roles_usertype_enum" AS ENUM('admin', 'super_user', 'member', 'user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text, "userType" "public"."user_roles_usertype_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(60) NOT NULL, "phone" character varying(15), "name" character varying(60) NOT NULL, "surname" character varying(60) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "suspended" boolean NOT NULL DEFAULT false, "userRoleId" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "REL_a52455e2cef06f0a3faf30f96a" UNIQUE ("userRoleId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."prompts_prompttype_enum" AS ENUM('admin', 'super_user', 'member', 'user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "prompts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "promptType" "public"."prompts_prompttype_enum" NOT NULL DEFAULT 'user', "prompt" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "UQ_b6af3f5e130ac741bc0b193cf8e" UNIQUE ("promptType"), CONSTRAINT "PK_21f33798862975179e40b216a1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "configs" ("key" character varying(255) NOT NULL, "value" text NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_03f58fb0f3cccd983dded221bf5" PRIMARY KEY ("key"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "command_permissions" ("command_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_d5c6104040405e771ff84f4c9da" PRIMARY KEY ("command_id", "role_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_a01264efc002c6c819c828d9ec" ON "command_permissions" ("command_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_81a52697ef962764c3572a65da" ON "command_permissions" ("role_id") `);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a52455e2cef06f0a3faf30f96a3" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "command_permissions" ADD CONSTRAINT "FK_a01264efc002c6c819c828d9ec7" FOREIGN KEY ("command_id") REFERENCES "commands"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "command_permissions" ADD CONSTRAINT "FK_81a52697ef962764c3572a65dac" FOREIGN KEY ("role_id") REFERENCES "user_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "command_permissions" DROP CONSTRAINT "FK_81a52697ef962764c3572a65dac"`);
    await queryRunner.query(`ALTER TABLE "command_permissions" DROP CONSTRAINT "FK_a01264efc002c6c819c828d9ec7"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a52455e2cef06f0a3faf30f96a3"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_81a52697ef962764c3572a65da"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a01264efc002c6c819c828d9ec"`);
    await queryRunner.query(`DROP TABLE "command_permissions"`);
    await queryRunner.query(`DROP TABLE "configs"`);
    await queryRunner.query(`DROP TABLE "prompts"`);
    await queryRunner.query(`DROP TYPE "public"."prompts_prompttype_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TYPE "public"."user_roles_usertype_enum"`);
    await queryRunner.query(`DROP TABLE "commands"`);
  }
}
