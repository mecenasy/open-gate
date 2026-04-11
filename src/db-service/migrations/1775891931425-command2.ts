import { MigrationInterface, QueryRunner } from 'typeorm';

export class Command21775891931425 implements MigrationInterface {
  name = 'Command21775891931425';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "commands" ADD "command" character varying(16)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "commands" DROP COLUMN "command"`);
  }
}
