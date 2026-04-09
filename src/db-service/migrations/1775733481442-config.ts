import { MigrationInterface, QueryRunner } from 'typeorm';

export class Config1775733481442 implements MigrationInterface {
  name = 'Config1775733481442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."configs_config_type_enum" AS ENUM('core', 'feature')`);
    await queryRunner.query(
      `ALTER TABLE "configs" ADD "config_type" "public"."configs_config_type_enum" NOT NULL DEFAULT 'feature'`,
    );
    await queryRunner.query(`ALTER TABLE "commands" DROP COLUMN "actions"`);
    await queryRunner.query(`ALTER TABLE "commands" ADD "actions" jsonb NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "prompts" ALTER COLUMN "key" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prompts" ALTER COLUMN "commandName" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prompts" ALTER COLUMN "description" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "prompts" ADD CONSTRAINT "UQ_e209e27c3343f0504f7a9647737" UNIQUE ("userType", "key", "commandName")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prompts" DROP CONSTRAINT "UQ_e209e27c3343f0504f7a9647737"`);
    await queryRunner.query(`ALTER TABLE "prompts" ALTER COLUMN "description" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prompts" ALTER COLUMN "commandName" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prompts" ALTER COLUMN "key" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "commands" DROP COLUMN "actions"`);
    await queryRunner.query(`ALTER TABLE "commands" ADD "actions" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "configs" DROP COLUMN "config_type"`);
    await queryRunner.query(`DROP TYPE "public"."configs_config_type_enum"`);
  }
}
