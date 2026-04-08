import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePrompt1775662641375 implements MigrationInterface {
  name = 'UpdatePrompt1775662641375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prompts" DROP CONSTRAINT "UQ_b6af3f5e130ac741bc0b193cf8e"`);
    await queryRunner.query(`ALTER TABLE "prompts" DROP COLUMN "promptType"`);
    await queryRunner.query(`DROP TYPE "public"."prompts_prompttype_enum"`);
    await queryRunner.query(`ALTER TABLE "prompts" ADD "key" character varying`);
    await queryRunner.query(`ALTER TABLE "prompts" ADD CONSTRAINT "UQ_5f1c030402ad99555ef6d5e8ab3" UNIQUE ("key")`);
    await queryRunner.query(`ALTER TABLE "prompts" ADD "description" text`);
    await queryRunner.query(
      `CREATE TYPE "public"."prompts_usertype_enum" AS ENUM('owner', 'admin', 'super_user', 'member', 'user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" ADD "userType" "public"."prompts_usertype_enum" NOT NULL DEFAULT 'user'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prompts" DROP COLUMN "userType"`);
    await queryRunner.query(`DROP TYPE "public"."prompts_usertype_enum"`);
    await queryRunner.query(`ALTER TABLE "prompts" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "prompts" DROP CONSTRAINT "UQ_5f1c030402ad99555ef6d5e8ab3"`);
    await queryRunner.query(`ALTER TABLE "prompts" DROP COLUMN "key"`);
    await queryRunner.query(
      `CREATE TYPE "public"."prompts_prompttype_enum" AS ENUM('owner', 'admin', 'super_user', 'member', 'user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" ADD "promptType" "public"."prompts_prompttype_enum" NOT NULL DEFAULT 'user'`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" ADD CONSTRAINT "UQ_b6af3f5e130ac741bc0b193cf8e" UNIQUE ("promptType")`,
    );
  }
}
