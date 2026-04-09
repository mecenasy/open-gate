import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCommand1775680313581 implements MigrationInterface {
  name = 'UpdateCommand1775680313581';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "commands" DROP COLUMN "actions"`);
    await queryRunner.query(`ALTER TABLE "commands" ADD "actions" jsonb NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "commands" DROP COLUMN "actions"`);
    await queryRunner.query(`ALTER TABLE "commands" ADD "actions" text NOT NULL`);
  }
}
