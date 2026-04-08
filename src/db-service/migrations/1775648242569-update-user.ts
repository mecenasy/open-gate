import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser1775648242569 implements MigrationInterface {
  name = 'UpdateUser1775648242569';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "suspended"`);
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('pending', 'active', 'suspended', 'banned')`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending'`);
    await queryRunner.query(`ALTER TABLE "users" ADD "ownerId" uuid`);
    await queryRunner.query(`ALTER TYPE "public"."user_roles_usertype_enum" RENAME TO "user_roles_usertype_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."user_roles_usertype_enum" AS ENUM('owner', 'admin', 'super_user', 'member', 'user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ALTER COLUMN "userType" TYPE "public"."user_roles_usertype_enum" USING "userType"::"text"::"public"."user_roles_usertype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_roles_usertype_enum_old"`);
    await queryRunner.query(`ALTER TYPE "public"."prompts_prompttype_enum" RENAME TO "prompts_prompttype_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."prompts_prompttype_enum" AS ENUM('owner', 'admin', 'super_user', 'member', 'user')`,
    );
    await queryRunner.query(`ALTER TABLE "prompts" ALTER COLUMN "promptType" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "prompts" ALTER COLUMN "promptType" TYPE "public"."prompts_prompttype_enum" USING "promptType"::"text"::"public"."prompts_prompttype_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "prompts" ALTER COLUMN "promptType" SET DEFAULT 'user'`);
    await queryRunner.query(`DROP TYPE "public"."prompts_prompttype_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."prompts_prompttype_enum_old" AS ENUM('admin', 'super_user', 'member', 'user')`,
    );
    await queryRunner.query(`ALTER TABLE "prompts" ALTER COLUMN "promptType" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "prompts" ALTER COLUMN "promptType" TYPE "public"."prompts_prompttype_enum_old" USING "promptType"::"text"::"public"."prompts_prompttype_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "prompts" ALTER COLUMN "promptType" SET DEFAULT 'user'`);
    await queryRunner.query(`DROP TYPE "public"."prompts_prompttype_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."prompts_prompttype_enum_old" RENAME TO "prompts_prompttype_enum"`);
    await queryRunner.query(
      `CREATE TYPE "public"."user_roles_usertype_enum_old" AS ENUM('admin', 'super_user', 'member', 'user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ALTER COLUMN "userType" TYPE "public"."user_roles_usertype_enum_old" USING "userType"::"text"::"public"."user_roles_usertype_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_roles_usertype_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."user_roles_usertype_enum_old" RENAME TO "user_roles_usertype_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "ownerId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "suspended" boolean NOT NULL DEFAULT false`);
  }
}
