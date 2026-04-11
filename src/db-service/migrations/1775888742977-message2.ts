import { MigrationInterface, QueryRunner } from 'typeorm';

export class Message21775888742977 implements MigrationInterface {
  name = 'Message21775888742977';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "messages" ADD "description" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "description"`);
  }
}
