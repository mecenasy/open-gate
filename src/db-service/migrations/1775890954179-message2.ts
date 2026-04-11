import { MigrationInterface, QueryRunner } from 'typeorm';

export class Message21775890954179 implements MigrationInterface {
  name = 'Message21775890954179';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."messages_type_enum" AS ENUM('message', 'error')`);
    await queryRunner.query(
      `ALTER TABLE "messages" ADD "type" "public"."messages_type_enum" NOT NULL DEFAULT 'message'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."messages_type_enum"`);
  }
}
